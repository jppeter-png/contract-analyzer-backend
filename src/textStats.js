// Word count that also works for Chinese, which has no spaces between words: each CJK
// ideograph counts as one (the usual "字数"), everything else is counted by whitespace.
function countWords(text) {
  const cjk = (text.match(/[一-鿿]/g) || []).length;
  const others = text.replace(/[一-鿿]/g, ' ').split(/\s+/).filter(Boolean).length;
  return cjk + others;
}

// Tesseract puts a space between Chinese characters ("人 民 币", "李 梅"), which would stop names
// and numbers from being recognized. Spaces next to Chinese characters, punctuation or digits
// are removed; spaces between Latin words ("Lease start date") are kept.
const CJK_SIDE = '[\\u4e00-\\u9fff\\u3000-\\u303f\\uff00-\\uffef]';
const GLUE = '[\\u4e00-\\u9fff\\u3000-\\u303f\\uff00-\\uffef0-9:;,.()%\\-]';
const CJK_SPACE = new RegExp(`(?<=${CJK_SIDE})[ \\t]+(?=${GLUE})|(?<=${GLUE})[ \\t]+(?=${CJK_SIDE})`, 'g');
function removeCjkSpacing(text) {
  return text.replace(CJK_SPACE, '');
}

module.exports = { countWords, removeCjkSpacing };
