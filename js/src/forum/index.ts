
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

const numeralSelectors = [
  '.Button-badge',
  '.DiscussionListItem-stats-item-label',
  '.HeaderDropdownBubble',
  '.item-discussion-count .userStat',
  '.item-comment-count .userStat',
  '.FollowUsers--count',
].join(',');

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

function localizeTextNode(node: Text): void {
  const parent = node.parentElement;

  if (!parent || !parent.closest(numeralSelectors)) {
    return;
  }

  const currentText = node.nodeValue ?? '';
  const localizedText = toPersianDigits(currentText);

  if (currentText !== localizedText) {
    node.nodeValue = localizedText;
  }
}

function localizeNumerals(root: ParentNode = document): void {
  if (root instanceof Element && root.matches(numeralSelectors)) {
    localizeElementText(root);
  }

  root.querySelectorAll(numeralSelectors).forEach((element) => {
    localizeElementText(element);
  });
}

function localizeElementText(element: Element): void {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let currentNode: Node | null;

  while ((currentNode = walker.nextNode())) {
    if (currentNode instanceof Text) {
      textNodes.push(currentNode);
    }
  }

  textNodes.forEach(localizeTextNode);
}

app.initializers.add('behrad-jalali-calendar', () => {
  localizeNumerals();

  const numeralObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        if (mutation.target instanceof Text) {
          localizeTextNode(mutation.target);
        }

        continue;
      }

      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          localizeTextNode(node as Text);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          localizeNumerals(node as Element);
        }
      });

      if (mutation.target instanceof Element) {
        const target = mutation.target;

        if (target.matches(numeralSelectors) || target.closest(numeralSelectors)) {
          localizeNumerals(target.closest(numeralSelectors) ?? target);
        }
      }
    }
  });

  numeralObserver.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });

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
