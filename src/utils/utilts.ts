import { Linking } from 'react-native';

export const currencyFormatter: any = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'TZS',
});

export const stripHtml = (html: any) => {
  return html.replace(/<[^>]*>?/gm, '');
};

export const truncate = (input: any, length: number) => {
  if (input.length > length) {
    return input.substring(0, length) + '...';
  }
  return input;
};

export const getAverageRating = (ratings: any) => {
  const average =
    ratings.reduce((total: any, next: any) => total + next.rating, 0) /
    ratings.length;

  return average ? average : 0;
};


export const makePhoneCall = phoneNumber => {
  Linking.openURL(`tel:${phoneNumber}`)
    .catch(error => {
      console.error('Error making phone call: ', error);
    });
};



export const formatDate = (d) => {
  date = new Date(d);
  year = date.getFullYear();
  month = date.getMonth() + 1;
  dt = date.getDate();

  if (dt < 10) {
    dt = "0" + dt;
  }
  if (month < 10) {
    month = "0" + month;
  }

  return dt + "/" + month + "/" + year;
};



export const transformDataToDropdownOptions=(data:any)=> {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map(item => ({
    label: item.name,
    value: item.id.toString(),
  }));
}


export const formatNumber = (number, decPlaces, decSep, thouSep) => {
  (decPlaces = isNaN((decPlaces = Math.abs(decPlaces))) ? 2 : decPlaces),
    (decSep = typeof decSep === 'undefined' ? '.' : decSep);
  thouSep = typeof thouSep === 'undefined' ? ',' : thouSep;
  var sign = number < 0 ? '-' : '';
  var i = String(
    parseInt((number = Math.abs(Number(number) || 0).toFixed(decPlaces))),
  );
  var j = (j = i.length) > 3 ? j % 3 : 0;

  return (
    sign +
    (j ? i.substr(0, j) + thouSep : '') +
    i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, '$1' + thouSep) +
    (decPlaces
      ? decSep +
      Math.abs(number - i)
        .toFixed(decPlaces)
        .slice(2)
      : '')
  );
};
