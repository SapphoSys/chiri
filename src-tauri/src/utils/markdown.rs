use pulldown_cmark::{html, Event, LinkType, Options, Parser, Tag, TagEnd};

fn find_plain_url_start(text: &str, from: usize) -> Option<usize> {
    let mut search_from = from;

    loop {
        let http_start = text[search_from..]
            .find("http://")
            .map(|offset| search_from + offset);
        let https_start = text[search_from..]
            .find("https://")
            .map(|offset| search_from + offset);
        let start = match (http_start, https_start) {
            (Some(http), Some(https)) => http.min(https),
            (Some(http), None) => http,
            (None, Some(https)) => https,
            (None, None) => return None,
        };

        let has_valid_boundary = start == 0
            || !text[..start]
                .chars()
                .next_back()
                .is_some_and(|character| character.is_ascii_alphanumeric() || character == '_');
        if has_valid_boundary {
            return Some(start);
        }

        search_from = start + 1;
    }
}

fn find_plain_url_end(text: &str, start: usize) -> usize {
    let mut end = text[start..]
        .char_indices()
        .find(|(_, character)| character.is_whitespace() || matches!(character, '<' | '>'))
        .map_or(text.len(), |(offset, _)| start + offset);

    while let Some((offset, character)) = text[start..end].char_indices().next_back() {
        let should_trim = matches!(character, '.' | ',' | '!' | '?' | ';' | ':')
            || (character == ')'
                && text[start..end].matches('(').count() < text[start..end].matches(')').count());
        if !should_trim {
            break;
        }

        end = start + offset;
    }

    end
}

fn autolink_plain_urls<'a>(events: impl Iterator<Item = Event<'a>>) -> Vec<Event<'a>> {
    let mut result = Vec::new();
    let mut link_depth = 0_usize;

    for event in events {
        if matches!(&event, Event::Start(Tag::Link { .. })) {
            link_depth += 1;
            result.push(event);
            continue;
        }

        if matches!(&event, Event::End(TagEnd::Link)) {
            link_depth = link_depth.saturating_sub(1);
            result.push(event);
            continue;
        }

        let Event::Text(text) = event else {
            result.push(event);
            continue;
        };

        if link_depth > 0 {
            result.push(Event::Text(text));
            continue;
        }

        let text = text.as_ref();
        let mut cursor = 0;
        while let Some(start_offset) = find_plain_url_start(text, cursor) {
            if start_offset > cursor {
                result.push(Event::Text(text[cursor..start_offset].to_string().into()));
            }

            let end = find_plain_url_end(text, start_offset);
            let url = &text[start_offset..end];
            result.push(Event::Start(Tag::Link {
                link_type: LinkType::Autolink,
                dest_url: url.to_string().into(),
                title: "".into(),
                id: "".into(),
            }));
            result.push(Event::Text(url.to_string().into()));
            result.push(Event::End(TagEnd::Link));
            cursor = end;
        }

        if cursor < text.len() {
            result.push(Event::Text(text[cursor..].to_string().into()));
        }
    }

    result
}

fn is_allowed_changelog_image_src(value: &str) -> bool {
    let Some(after_scheme) = value.strip_prefix("https://") else {
        return false;
    };

    let (authority, path) =
        after_scheme
            .split_once(['/', '?', '#'])
            .map_or((after_scheme, ""), |(authority, rest)| {
                (
                    authority,
                    &after_scheme[authority.len()..authority.len() + 1 + rest.len()],
                )
            });
    if authority.is_empty() || authority.contains('@') {
        return false;
    }

    let host = authority
        .split_once(':')
        .map_or(authority, |(host, _port)| host)
        .to_ascii_lowercase();

    match host.as_str() {
        "github.com" => {
            path.starts_with("/chiriapp/chiri/")
                || path.starts_with("/user-attachments/assets/")
                || path.starts_with("/assets/")
        }
        "raw.githubusercontent.com" => path.starts_with("/chiriapp/chiri/"),
        "user-images.githubusercontent.com"
        | "private-user-images.githubusercontent.com"
        | "camo.githubusercontent.com" => true,
        _ => false,
    }
}

#[tauri::command]
pub fn parse_and_sanitize_markdown(markdown: String) -> String {
    // Parse Markdown to HTML. GitHub alerts are part of pulldown-cmark's GFM
    // extensions and render as markdown-alert-* classes on blockquotes.
    let parser = Parser::new_ext(&markdown, Options::ENABLE_GFM);
    let parser = autolink_plain_urls(parser).into_iter();
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);

    // sanitize the HTML output using ammonia. keep changelog images, but only
    // from GitHub-controlled origins so release notes cannot beacon arbitrary
    // third-party hosts when rendered
    ammonia::Builder::default()
        .add_tag_attributes("blockquote", ["class"])
        .attribute_filter(|element, attribute, value| {
            if element == "img" && attribute == "src" {
                return is_allowed_changelog_image_src(value).then(|| value.into());
            }
            Some(value.into())
        })
        .clean(&html_output)
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keeps_github_release_note_images() {
        let html = parse_and_sanitize_markdown(
            "![demo](https://github.com/user-attachments/assets/abc123)".to_string(),
        );

        assert!(html.contains(r#"<img src="https://github.com/user-attachments/assets/abc123""#));
    }

    #[test]
    fn strips_non_github_changelog_image_sources() {
        let html = parse_and_sanitize_markdown(
            "![tracker](https://tracker.example/pixel.png)".to_string(),
        );

        assert!(html.contains(r#"<img alt="tracker">"#));
        assert!(!html.contains("tracker.example"));
    }

    #[test]
    fn strips_relative_changelog_image_sources() {
        let html = parse_and_sanitize_markdown("![local](/pixel.png)".to_string());

        assert!(html.contains(r#"<img alt="local">"#));
        assert!(!html.contains("/pixel.png"));
    }

    #[test]
    fn renders_github_markdown_alerts() {
        for (kind, class) in [
            ("NOTE", "markdown-alert-note"),
            ("TIP", "markdown-alert-tip"),
            ("IMPORTANT", "markdown-alert-important"),
            ("WARNING", "markdown-alert-warning"),
            ("CAUTION", "markdown-alert-caution"),
        ] {
            let markdown = format!("> [!{kind}]\n> Alert details with **formatting**.");
            let html = parse_and_sanitize_markdown(markdown);

            assert!(html.contains(&format!(r#"<blockquote class="{class}">"#)));
            assert!(html.contains("Alert details with <strong>formatting</strong>."));
            assert!(!html.contains("[!"));
        }
    }

    #[test]
    fn autolinks_plain_urls() {
        let html = parse_and_sanitize_markdown(
            "> [!NOTE]\n> Support Chiri: https://liberapay.com/chloe".to_string(),
        );

        assert!(html.contains(
            r#"<a href="https://liberapay.com/chloe" rel="noopener noreferrer">https://liberapay.com/chloe</a>"#
        ));
    }

    #[test]
    fn does_not_autolink_urls_in_code_or_existing_links() {
        let html = parse_and_sanitize_markdown(
            "`https://example.com/code` [existing](https://example.com/link)".to_string(),
        );

        assert!(html.contains("<code>https://example.com/code</code>"));
        assert_eq!(html.matches("<a href=").count(), 1);
        assert!(html.contains(
            r#"<a href="https://example.com/link" rel="noopener noreferrer">existing</a>"#
        ));
    }
}
