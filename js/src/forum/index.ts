import app from 'flarum/forum/app';
import { override } from 'flarum/common/extend';

const jalaliLocale = 'fa-IR-u-ca-persian-nu-arabext';

const fullTimeFormatter = new Intl.DateTimeFormat(jalaliLocale, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const scrubberFormatter = new Intl.DateTimeFormat(jalaliLocale, {
  year: 'numeric',
  month: 'long',
});

const humanTimeShortFormatter = new Intl.DateTimeFormat(jalaliLocale, {
  day: 'numeric',
  month: 'short',
});

const humanTimeLongFormatter = new Intl.DateTimeFormat(jalaliLocale, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const fromNowPatchMarker = '__behradJalaliCalendarFromNowPatched';

function toPersianDigits(value: string): string {
  const persianDigits = [
    '\u06F0',
    '\u06F1',
    '\u06F2',
    '\u06F3',
    '\u06F4',
    '\u06F5',
    '\u06F6',
    '\u06F7',
    '\u06F8',
    '\u06F9',
  ];

  return value.replace(/\d/g, (digit) => persianDigits[Number(digit)]);
}

function localizeButtonBadges(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('.Button-badge').forEach((badge) => {
    const currentText = badge.textContent ?? '';
    const localizedText = toPersianDigits(currentText);

    if (currentText !== localizedText) {
      badge.textContent = localizedText;
    }
  });
}

app.initializers.add('behrad-jalali-calendar', () => {
  // Localize existing badges.
  localizeButtonBadges();

  // Observe newly added elements and changes to badge text.
  const badgeObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        const parent = mutation.target.parentElement;

        if (parent?.closest('.Button-badge')) {
          localizeButtonBadges(parent.closest('.Button-badge')!.parentElement ?? document);
        }

        continue;
      }

      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }

        const element = node as HTMLElement;

        if (element.matches('.Button-badge')) {
          const currentText = element.textContent ?? '';
          const localizedText = toPersianDigits(currentText);

          if (currentText !== localizedText) {
            element.textContent = localizedText;
          }
        }

        localizeButtonBadges(element);
      });

      if (
        mutation.target instanceof Element &&
        mutation.target.closest('.Button-badge')
      ) {
        localizeButtonBadges(
          mutation.target.closest('.Button-badge')!.parentElement ?? document
        );
      }
    }
  });

  badgeObserver.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  // Format Flarum dates using the Jalali calendar.
  override(app.translator, 'formatDateTime', function (original, time, id) {
    if (time) {
      const timestamp = time.valueOf();

      switch (id) {
        case 'core.lib.datetime_formats.fullTime':
          return fullTimeFormatter.format(timestamp);

        case 'core.lib.datetime_formats.scrubber':
          return scrubberFormatter.format(timestamp);

        case 'core.lib.datetime_formats.humanTimeShort':
          return humanTimeShortFormatter.format(timestamp);

        case 'core.lib.datetime_formats.humanTimeLong':
          return humanTimeLongFormatter.format(timestamp);
      }
    }

    return original(time, id);
  });

  // Convert relative-time digits to Persian digits.
  const globalDayjs = (window as any).dayjs;
  const prototype = globalDayjs?.prototype;

  if (!prototype?.fromNow || prototype[fromNowPatchMarker]) {
    return;
  }

  const originalFromNow = prototype.fromNow;

  prototype.fromNow = function (...args: any[]) {
    return toPersianDigits(originalFromNow.apply(this, args));
  };

  prototype[fromNowPatchMarker] = true;
});
