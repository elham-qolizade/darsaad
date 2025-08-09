export function convertEnglishNumbersToPersian(input) {
  input = String(input || '');
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  let output = '';
  for (let char of input) {
    const index = englishNumbers.indexOf(char);
    output += index !== -1 ? persianNumbers[index] : char;
  }
  return output;
}

export function convertPersianNumbersToEnglish(input) {
  input = String(input || '');
  const persianNumbers = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  const englishNumbers = ['0','1','2','3','4','5','6','7','8','9'];

  let output = '';
  for(let char of input) {
    const index = persianNumbers.indexOf(char);
    output += index !== -1 ? englishNumbers[index] : char;
  }
  return output;
}
