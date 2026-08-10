import {
  SidebarContextMenuOverlay,
  type SidebarContextMenuOverlayProps,
} from '$components/sidebar/SidebarContextMenuOverlay';
import {
  SidebarModalOverlays,
  type SidebarModalOverlaysProps,
} from '$components/sidebar/SidebarModalOverlays';

interface SidebarOverlaysProps {
  contextMenuOverlay: SidebarContextMenuOverlayProps;
  modalOverlays: SidebarModalOverlaysProps;
}

export const SidebarOverlays = ({ contextMenuOverlay, modalOverlays }: SidebarOverlaysProps) => (
  <>
    <SidebarContextMenuOverlay {...contextMenuOverlay} />
    <SidebarModalOverlays {...modalOverlays} />
  </>
);
