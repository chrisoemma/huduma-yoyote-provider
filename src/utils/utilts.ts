import { Alert, Linking } from 'react-native';
import { GOOGLE_MAPS_API_KEY } from './config';

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


export function validateTanzanianPhoneNumber(phoneNumber) {
  // Remove any spaces and non-numeric characters
  const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');

  // Check the length and format
  if (cleanedPhoneNumber.match(/^(0\d{9}|255\d{9})$/)) {
    // Valid Tanzanian phone number format
    if (cleanedPhoneNumber.startsWith('0')) {
      return `+255${cleanedPhoneNumber.substring(1)}`;
    } else if (cleanedPhoneNumber.startsWith('255')) {
      return `+${cleanedPhoneNumber}`;
    } else if (cleanedPhoneNumber.startsWith('+255')) {
      return cleanedPhoneNumber; // No change if already formatted as '+255'
    }
  } else {
    // Invalid phone number format
    return null;
  }
}

export function removeEmptyObjects(array) {
  return array.filter(obj => Object.keys(obj).length > 0);
}

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


export const getLocationName = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('dataaaaMap',data);
    if (data.results.length > 0) {
      const addressComponents = data.results[0].address_components;

      // Extract relevant parts of the address (e.g., locality and country)
      const locationNameParts = addressComponents
        .filter((component) =>
          ['locality', 'administrative_area_level_1', 'country'].includes(
            component.types[0]
          )
        )
        .map((component) => component.long_name)
        .join(', ');

      return locationNameParts;
    } else {
      return 'Location not found';
    }
  } catch (error) {
  //  console.error('Error fetching location data:', error);
    return 'Error fetching location data';
  }
};

export function breakTextIntoLines(text, maxLength) {
  if (text.length <= maxLength) {
    return text; // No need to break into lines if it's within the maxLength
  }

  const chunks = [];
  while (text.length > 0) {
    chunks.push(text.substring(0, maxLength));
    text = text.substring(maxLength);
  }

  return chunks.join('\n');
}



export const  convertBusinessesToLabelsAndValues=(businesses)=> {
  const labelsAndValues = businesses.map((business) => ({
    value: business.service.id.toString(),
    label: business.service.name,
  }));
  return labelsAndValues;
}

export const convertRegDoc=(regdocs)=> {
  const labelsAndValues = regdocs.map((doc) => ({
    value: doc.id,
    label: doc.doc_name,
    percentage:doc.percentage
  }));
  return labelsAndValues;
}


export const transformArray = (inputArray, labelKey, valueKey) => {
  if (!inputArray || inputArray.length === 0) {
    return [];
  }

  let resultArray = [];

  inputArray.forEach(item => {
    let labelValue = {
      'label': item[labelKey],
      'value': item[valueKey]
    };
    resultArray.push(labelValue);
  });

  return resultArray;
};


export async function validateNIDANumber(nidaNumber) {
  // Replace 'YOUR_API_ENDPOINT' with the actual API endpoint for NIDA validation
  const apiEndpoint = `https://ors.brela.go.tz/um/load/load_nida/${nidaNumber}`;

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
    
  } catch (error) {

    return {
      status: 'Error',
      error: error.message || 'Unknown error during validation',
    };
  }
}

export const formatErrorMessages=(errorObject)=>{
  if (!errorObject) {
      return 'Unknown error';
  }

  // If errorObject is a string, try parsing it as JSON
  if (typeof errorObject === 'string') {
      try {
          const parsedError = JSON.parse(errorObject);

          // Check if the parsed error is an object
          if (typeof parsedError === 'object') {
              // Now, you can handle the parsed error as an object
              return formatErrorMessages(parsedError);
          } else {
              // If parsing fails or the result is not an object, return the original string
              return errorObject;
          }
      } catch (parseError) {
          // Parsing failed, return the original string
          return errorObject;
      }
  }

  if (typeof errorObject === 'object') {
      let errorMessage = '';

      // Check if the errorObject has a property named 'errors'
      if (errorObject.errors) {
          for (const key in errorObject.errors) {
              if (errorObject.errors.hasOwnProperty(key) && Array.isArray(errorObject.errors[key]) && errorObject.errors[key].length > 0) {
                  errorMessage += `${errorObject.errors[key][0]}\n`;
              }
          }
      } else {
          // If 'errors' property is not found, iterate through the object directly
          for (const key in errorObject) {
              if (errorObject.hasOwnProperty(key) && Array.isArray(errorObject[key]) && errorObject[key].length > 0) {
                  errorMessage += `${errorObject[key][0]}\n`;
              }
          }
      }

      // Remove the trailing <br> before returning
      return errorMessage.trim();
  }

  return 'Unknown error';
}


export const showErrorWithLineBreaks = (errors) => {
  const errorArray = errors.split('\n');
  
  Alert.alert(
    'Error',
    errorArray.join('\n'),  // Combine the errors back with line breaks
    [
      { text: 'OK', onPress: () => console.log('OK Pressed') }
    ],
    { cancelable: false }
  );
};




