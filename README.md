# Jalali Calendar for Flarum

A Flarum extension that displays dates using the Solar Hijri (Jalali) calendar and Persian numerals.

## Features

- Displays supported absolute dates using the Jalali calendar.
- Localizes supported date labels, including the discussion list scrubber.
- Converts relative-time digits to Persian numerals.
- Uses the browser's built-in `Intl.DateTimeFormat` support.

## Requirements

- Flarum 2.0 or later.
- A browser with support for the `Intl` Persian calendar and numbering system.

## Installation

Once the package is available on Packagist, install it from your Flarum installation directory:

```bash
composer require persian-tools/jalali-calendar
```

Enable the extension from the Flarum administration panel, or run:

```bash
php flarum extension:enable persian-tools-jalali-calendar
```

To clear the Flarum cache, run:

```bash
php flarum cache:clear
```

## Compatibility

This extension targets Flarum 2.x. It changes supported date displays in the forum frontend; it does not change dates stored in the database.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
