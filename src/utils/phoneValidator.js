const PNF = require("google-libphonenumber").PhoneNumberFormat;
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();
const PNT = require("google-libphonenumber").PhoneNumberType;

const validatePhoneNumber = (phoneNumber, region_code) => {
  if (!phoneUtil.getSupportedRegions().includes(region_code.toUpperCase())) {
    return {
      status: false,
      message: `Your region is not supported`,
    };
  }
  const number = phoneUtil.parseAndKeepRawInput(
    phoneNumber,
    region_code.toUpperCase()
  );
  if (!phoneUtil.isValidNumberForRegion(number, region_code.toUpperCase())) {
    return {
      status: false,
      message: `Invalid Phone Number for region ${region_code}`,
    };
  }

  if (phoneUtil.getNumberType(number) !== PNT.MOBILE) {
    return {
      status: false,
      message: `Invalid Phone Number type. Enter a valid mobile number`,
    };
  }

  return {
    status: true,
    message: phoneUtil.format(number, PNF.INTERNATIONAL),
  };
};

// validatePhoneNumber("07034969842", "ng");
module.exports = { validatePhoneNumber };
