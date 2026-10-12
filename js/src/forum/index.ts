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

const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
const fromNowPatchMarker = '__behradJalaliCalendarFromNowPatched';

function toPersianDigits(value: string): string {
  return value.replace(/\d/g, (digit) => persianDigits[Number(digit)]);
}

app.initializers.add('behrad-jalali-calendar', () => {
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

