// import { Label } from 'semantic-ui-react';

// export function renderText(text, limit) {
//   if (text.length > limit) {
//     return text.slice(0, limit - 3) + '...';
//   }
//   return text;
// }

// export function renderGroup(group) {
//   if (group === '') {
//     return <Label>default</Label>;
//   }
//   let groups = group.split(',');
//   groups.sort();
//   return <>
//     {groups.map((group) => {
//       if (group === 'vip' || group === 'pro') {
//         return <Label color='yellow'>{group}</Label>;
//       } else if (group === 'svip' || group === 'premium') {
//         return <Label color='red'>{group}</Label>;
//       }
//       return <Label>{group}</Label>;
//     })}
//   </>;
// }

export function renderNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + "B";
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + "M";
  } else if (num >= 10000) {
    return (num / 1000).toFixed(2) + "k";
  } else {
    return num;
  }
}

// export function renderQuota(quota, digits = 2) {
//   let quotaPerUnit = localStorage.getItem('quota_per_unit');
//   let displayInCurrency = localStorage.getItem('display_in_currency');
//   quotaPerUnit = parseFloat(quotaPerUnit);
//   displayInCurrency = displayInCurrency === 'true';
//   if (displayInCurrency) {
//     return '$' + (quota / quotaPerUnit).toFixed(digits);
//   }
//   return renderNumber(quota);
// }

// export function renderQuotaWithPrompt(quota, digits) {
//   let displayInCurrency = localStorage.getItem('display_in_currency');
//   displayInCurrency = displayInCurrency === 'true';
//   if (displayInCurrency) {
//     return `（等价金额：${renderQuota(quota, digits)}）`;
//   }
//   return '';
// }
