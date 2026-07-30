import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type PackageAuthor = string | Record<string, unknown>;
type PackageRepository = string | { url?: string };

interface PackageJson {
  author?: PackageAuthor;
  dependencies?: Record<string, string>;
  license?: string | Record<string, unknown>;
  licenseFile?: string;
  repository?: PackageRepository;
  version?: string;
}

interface PnpmLicensePackage {
  author?: PackageAuthor;
  homepage?: string;
  license?: string | Record<string, unknown>;
  name: string;
  paths?: string[];
  versions?: string[];
}

interface CargoDependencyKind {
  kind: string | null;
  target: string | null;
}

interface CargoDependency {
  dep_kinds?: CargoDependencyKind[];
  pkg: string;
}

interface CargoNode {
  deps?: CargoDependency[];
  id: string;
}

interface CargoPackage {
  homepage?: string | null;
  id: string;
  license?: string | null;
  license_file?: string | null;
  manifest_path: string;
  name: string;
  repository?: string | null;
  source?: string | null;
  version: string;
}

interface CargoMetadata {
  packages: CargoPackage[];
  resolve: {
    nodes: CargoNode[];
  };
}

interface LicenseEntry {
  author?: PackageAuthor;
  direct: boolean;
  ecosystem: 'cargo' | 'npm';
  license: string;
  licenseText?: string;
  name: string;
  url: string;
  version: string;
}

type GeneratedLicenseEntry = Omit<LicenseEntry, 'licenseText'> & {
  licenseTextId?: string;
};

interface LicenseManifest {
  entries: GeneratedLicenseEntry[];
  licenseTexts: Record<string, string>;
}

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = join(rootDir, 'public/licenses.generated.json');
const commandOptions = {
  cwd: rootDir,
  encoding: 'utf8' as const,
  maxBuffer: 128 * 1024 * 1024,
};

const runJsonCommand = <T>(command: string, args: string[]): T =>
  JSON.parse(execFileSync(command, args, commandOptions));

const readJson = <T>(path: string): T | null => {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    return null;
  }
};

const normalizeUrl = (value: string | PackageRepository | null | undefined) => {
  if (!value) return undefined;

  const url = typeof value === 'string' ? value : value.url;
  if (!url) return undefined;

  return url
    .replace(/^git\+/, '')
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/\.git$/, '');
};

const readTextFile = (path: string) => {
  try {
    return readFileSync(path, 'utf8').replace(/\r\n/g, '\n').trim();
  } catch {
    return undefined;
  }
};

const readLicenseText = (
  packageDir: string,
  declaredLicense: string | null | undefined,
  explicitLicenseFile: string | null | undefined,
) => {
  const explicitPath = explicitLicenseFile ? resolve(packageDir, explicitLicenseFile) : undefined;
  const packageFiles = existsSync(packageDir)
    ? readdirSync(packageDir, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => /^(?:licen[cs]e|copying|unlicense)/i.test(name))
    : [];
  const candidates = [
    ...(explicitPath && existsSync(explicitPath) ? [explicitPath] : []),
    ...packageFiles.map((name) => join(packageDir, name)),
  ];
  const uniqueCandidates = [...new Set(candidates)];
  const licenseExpression = (declaredLicense ?? '').toLowerCase();
  const matchingCandidates = uniqueCandidates.filter((path) => {
    const name = path.toLowerCase();
    const isSpecificLicenseFile = /-(?:mit|apache|isc|bsd|mpl|gpl|lgpl)(?:\.|$)/.test(name);

    if (!isSpecificLicenseFile) return true;
    return (
      (licenseExpression.includes('mit') && name.includes('-mit')) ||
      (licenseExpression.includes('apache') && name.includes('-apache')) ||
      (licenseExpression.includes('isc') && name.includes('-isc')) ||
      (licenseExpression.includes('bsd') && name.includes('-bsd')) ||
      (licenseExpression.includes('mpl') && name.includes('-mpl')) ||
      (licenseExpression.includes('gpl') && name.includes('-gpl'))
    );
  });
  const texts = matchingCandidates
    .map(readTextFile)
    .filter((text): text is string => Boolean(text));

  return texts.length > 0 ? texts.join('\n\n') : undefined;
};

const getNpmPackageEntries = (
  packageInfo: PnpmLicensePackage,
  directDependencies: Set<string>,
): LicenseEntry[] => {
  const versions = packageInfo.versions ?? [];
  const paths = packageInfo.paths ?? [];
  const packageCount = Math.max(versions.length, paths.length, 1);

  return Array.from({ length: packageCount }, (_, index) => {
    const packagePath = paths[index] ?? paths[0];
    const packageJson = packagePath
      ? readJson<PackageJson>(join(packagePath, 'package.json'))
      : null;
    const version = versions[index] ?? packageJson?.version;
    const license = packageInfo.license ?? packageJson?.license ?? 'UNKNOWN';
    const url =
      normalizeUrl(packageJson?.repository) ??
      normalizeUrl(packageInfo.homepage) ??
      `https://www.npmjs.com/package/${packageInfo.name}`;

    return {
      ecosystem: 'npm',
      direct: directDependencies.has(packageInfo.name),
      name: packageInfo.name,
      version: version ?? 'unknown',
      license: typeof license === 'string' ? license : JSON.stringify(license),
      url,
      author: packageInfo.author ?? packageJson?.author,
      licenseText: packagePath
        ? readLicenseText(
            packagePath,
            typeof license === 'string' ? license : undefined,
            packageJson?.licenseFile,
          )
        : undefined,
    };
  });
};

const getNpmEntries = (): LicenseEntry[] => {
  const appPackage = readJson<PackageJson>(join(rootDir, 'package.json')) ?? {};
  const directDependencies = new Set(Object.keys(appPackage.dependencies ?? {}));
  const packagesByLicense = runJsonCommand<Record<string, PnpmLicensePackage[]>>('pnpm', [
    'licenses',
    'list',
    '--prod',
    '--json',
    '--long',
  ]);

  return Object.values(packagesByLicense).flatMap((packages) =>
    packages.flatMap((packageInfo) => getNpmPackageEntries(packageInfo, directDependencies)),
  );
};

const getCargoEntries = (): LicenseEntry[] => {
  const metadata = runJsonCommand<CargoMetadata>('cargo', [
    'metadata',
    '--locked',
    '--format-version',
    '1',
    '--manifest-path',
    'src-tauri/Cargo.toml',
  ]);
  const nodesById = new Map(metadata.resolve.nodes.map((node) => [node.id, node]));
  const rootPackage = metadata.packages.find((packageInfo) => !packageInfo.source);
  const rootNode = rootPackage ? nodesById.get(rootPackage.id) : undefined;
  const directRuntimePackageIds = new Set(
    (rootNode?.deps ?? [])
      .filter(({ dep_kinds }) => dep_kinds?.some(({ kind }) => kind === null))
      .map(({ pkg }) => pkg),
  );
  const runtimePackageIds = new Set<string>();
  const pendingPackageIds = rootPackage ? [rootPackage.id] : [];

  while (pendingPackageIds.length > 0) {
    const packageId = pendingPackageIds.pop();
    if (!packageId || runtimePackageIds.has(packageId)) continue;

    runtimePackageIds.add(packageId);
    const node = nodesById.get(packageId);
    for (const dependency of node?.deps ?? []) {
      const isRuntimeDependency = dependency.dep_kinds?.some(({ kind }) => kind === null);
      if (isRuntimeDependency && !runtimePackageIds.has(dependency.pkg)) {
        pendingPackageIds.push(dependency.pkg);
      }
    }
  }

  return metadata.packages
    .filter((packageInfo) => packageInfo.source && runtimePackageIds.has(packageInfo.id))
    .map((packageInfo) => {
      const packageDir = dirname(packageInfo.manifest_path);
      const url =
        normalizeUrl(packageInfo.repository) ??
        normalizeUrl(packageInfo.homepage) ??
        `https://crates.io/crates/${packageInfo.name}`;

      return {
        ecosystem: 'cargo',
        direct: directRuntimePackageIds.has(packageInfo.id),
        name: packageInfo.name,
        version: packageInfo.version,
        license: packageInfo.license ?? 'UNKNOWN',
        url,
        licenseText: readLicenseText(packageDir, packageInfo.license, packageInfo.license_file),
      };
    });
};

const sortEntries = (entries: LicenseEntry[]) =>
  entries.sort(
    (left, right) =>
      left.ecosystem.localeCompare(right.ecosystem) ||
      left.name.localeCompare(right.name) ||
      left.version.localeCompare(right.version) ||
      left.license.localeCompare(right.license),
  );

const buildManifest = (): LicenseManifest => {
  const allEntries = sortEntries([...getNpmEntries(), ...getCargoEntries()]);
  const seen = new Set<string>();
  const licenseTexts: Record<string, string> = {};
  const textIds = new Map<string, string>();
  const entries: GeneratedLicenseEntry[] = [];

  for (const entry of allEntries) {
    const key = `${entry.ecosystem}:${entry.name}:${entry.version}:${entry.license}:${entry.url}:${entry.direct}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const { licenseText, ...metadata } = entry;
    const generatedEntry: GeneratedLicenseEntry = metadata;
    if (licenseText) {
      let textId = textIds.get(licenseText);
      if (!textId) {
        textId = `license-${textIds.size + 1}`;
        textIds.set(licenseText, textId);
        licenseTexts[textId] = licenseText;
      }
      generatedEntry.licenseTextId = textId;
    }
    entries.push(generatedEntry);
  }

  return { entries, licenseTexts };
};

const generated = `${JSON.stringify(buildManifest(), null, 2)}\n`;
const checkOnly = process.argv.includes('--check');

if (checkOnly) {
  if (!existsSync(outputPath)) {
    throw new Error(`Generated license manifest is missing: ${outputPath}`);
  }

  const existing = readFileSync(outputPath, 'utf8');
  if (existing !== generated) {
    throw new Error('Generated license manifest is stale. Run `pnpm licenses:generate`.');
  }

  console.log(`License manifest is current (${JSON.parse(generated).entries.length} packages).`);
} else {
  writeFileSync(outputPath, generated);
  console.log(`Wrote license manifest (${JSON.parse(generated).entries.length} packages).`);
}
