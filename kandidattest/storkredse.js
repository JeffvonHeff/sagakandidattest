(function (root) {
  "use strict";

  var STORKREDSE = [
    "Bornholm",
    "Fyn",
    "København",
    "Københavns Omegn",
    "Nordjylland",
    "Nordsjælland",
    "Sjælland",
    "Sydjylland",
    "Vestjylland",
    "Østjylland",
  ];

  function normalizeStorkreds(value) {
    if (!value || value === "N/A") return "";
    return value
      .trim()
      .replace(/København(?!s)\s*Omegn/g, "Københavns Omegn");
  }

  var exported = { STORKREDSE: STORKREDSE, normalizeStorkreds: normalizeStorkreds };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = exported;
  } else {
    root.STORKREDS_DATA = exported;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
