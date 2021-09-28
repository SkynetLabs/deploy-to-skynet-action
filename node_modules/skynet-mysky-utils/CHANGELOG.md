# Changelog

## [0.3.0]

### Changed

- **[Breaking change]** Path functions return paths as lowercase.
- **[Breaking change]** Path functions return `null` for cases that were previously allowed.

### Removed

- **[Breaking change]** Removed deprecated 'CustomUserIDOptions'.

## [0.2.3]

### Added

- `removeAdjacentChars` function.

## [0.2.2]

### Added

- `CustomUserIDOptions` type.

## [0.2.0]

### Added

- Path helpers: `getPathDomain`, `getParentPath`, `sanitizePath`
- String helper: `trimSuffix`
- Permissions helpers: `permCategoryToString`, `permTypeToString`

### Removed

- Storage listener helpers

## [0.1.2]

### Changed

- Fix createFullScreenIframe and monitorWindowError

## [0.1.1]

### Added

- CheckPermissionResponse type

## [0.1.0]

### Added

- First release
