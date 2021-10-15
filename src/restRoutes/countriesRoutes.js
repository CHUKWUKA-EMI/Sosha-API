const { Router } = require("express");
const { default: axios } = require("axios");
const phoneUtil = require("google-libphonenumber").PhoneNumberUtil.getInstance();

const router = Router();

router.get("/", async (_, res) => {
  const region_codes = phoneUtil.getSupportedRegions();
  try {
    const countries = await axios.get(
      "https://countriesnow.space/api/v0.1/countries/states"
    );
    const countriesFlags = await axios.get(
      "https://countriesnow.space/api/v0.1/countries/flag/images"
    );
    const flagData = countriesFlags.data.data;
    const countries_data = countries.data.data.map((country) => ({
      name: country.name,
      region_code: country.iso3.slice(0, 2),
      flag: flagData.find((flag) => flag.name === country.name)
        ? flagData.find((flag) => flag.name === country.name).flag
        : "",
      states: country.states,
    }));
    const supportedCountries = countries_data.filter((country) =>
      region_codes.includes(country.region_code.toUpperCase())
    );
    return res.status(200).json(supportedCountries);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
