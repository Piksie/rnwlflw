console.log("beta jsdelivr");

/*
/* ========== BUSINESS LOGIC ========== */

/** > comment */
console.log("New Beta Loaded!!!");

const config = {
  showProratedDiscounts: false,
  formIDs: ["wf-form-Renewal-Email-PDF-Quote"], // re-enabling this to fix the hidden form functionality
  //  formIDs: ["formRenewal", "formRenewalEmail"], Matt: Commenting this out because the hidden form functionality is no longer working
  prices: [
    {
      staffCount: 1,
      starterPerUser: 99.0,
      premiumPerUser: 149.0,
      rubricAddOn: 16.67,
      insightsAddOn: 16.67,
      rewardsAddOn: 16.67,
    },
    {
      staffCount: 10,
      starterPerUser: 59.0,
      premiumPerUser: 109.0,
      rubricAddOn: 16.67,
      insightsAddOn: 16.67,
      rewardsAddOn: 16.67,
    },
    {
      staffCount: 20,
      starterPerUser: 59.0,
      premiumPerUser: 109.0,
      rubricAddOn: 16.67,
      insightsAddOn: 16.67,
      rewardsAddOn: 16.67,
    },
    {
      staffCount: 30,
      starterPerUser: 59.0,
      premiumPerUser: 109.0,
      rubricAddOn: 16.67,
      insightsAddOn: 16.67,
      rewardsAddOn: 16.67,
    },
    {
      staffCount: 40,
      starterPerUser: 49.0,
      premiumPerUser: 99.0,
      rubricAddOn: 16.67,
      insightsAddOn: 16.67,
      rewardsAddOn: 16.67,
    },
    {
      staffCount: 50,
      starterPerUser: 49.0,
      premiumPerUser: 99.0,
      rubricAddOn: 16.67,
      insightsAddOn: 16.67,
      rewardsAddOn: 16.67,
    },
    {
      staffCount: 60,
      starterPerUser: 49.0,
      premiumPerUser: 99.0,
      rubricAddOn: 16.67,
      insightsAddOn: 16.67,
      rewardsAddOn: 16.67,
    },
    {
      staffCount: 70,
      starterPerUser: 39.0,
      premiumPerUser: 89.0,
      rubricAddOn: 16.67,
      insightsAddOn: 16.67,
      rewardsAddOn: 16.67,
    },
    {
      staffCount: 80,
      starterPerUser: 39.0,
      premiumPerUser: 89.0,
      rubricAddOn: 16.67,
      insightsAddOn: 16.67,
      rewardsAddOn: 16.67,
    },
    {
      staffCount: 90,
      starterPerUser: 39.0,
      premiumPerUser: 89.0,
      rubricAddOn: 16.67,
      insightsAddOn: 16.67,
      rewardsAddOn: 16.67,
    },
    {
      staffCount: 100,
      starterPerUser: 35.0,
      premiumPerUser: 79.0,
      rubricAddOn: 14.67,
      insightsAddOn: 14.67,
      rewardsAddOn: 14.67,
    },
    {
      staffCount: 200,
      starterPerUser: 35.0,
      premiumPerUser: 65.0,
      rubricAddOn: 10.0,
      insightsAddOn: 10.0,
      rewardsAddOn: 10.0,
    },
  ],
  trainingPrices: {
    teacherTrainingAddOn: 750,
    slOnboardingAddOn: 400,
  },
  multiYearDiscounts: {
    1: 0,
    2: 0.1,
    3: 0.15,
    4: 0.2,
    5: 0.25,
  },
};

const queryParams = new URLSearchParams(window.location.search);

// Iterate through each query parameter and add it to the config object
queryParams.forEach((value, key) => {
  if (value === "0" || value === "1")
    config[key] = value === "0" ? false : true;
  else config[key] = value;
});

//normalize districtDiscount, which is written as 0-100 values
if (typeof config.districtDiscount != "undefined")
  config.districtDiscount =
    config.districtDiscount > 1
      ? config.districtDiscount / 100
      : config.districtDiscount;

// Store original recommendedPlan for comparison
const originalRecommendedPlan = config.recommendedPlan;

function getConfig() {
  // Determine if we should show recommendedMsg
  const shouldShowRecommendationMsg =
    !config.selectedPlan || config.selectedPlan === originalRecommendedPlan;

  // If selectedPlan exists and it matches original recommendedPlan,
  // use it (recommendationMsg will show)
  // If selectedPlan exists but doesn't match, use that (recommendationMsg wont show)
  // If selectedPlan doesn't exist, use original behavior
  if (config.selectedPlan) {
    config.recommendedPlan = config.selectedPlan;
  }

  return {
    users: config.userCount,
    thisUsersEmail: config.email,
    primaryContact: {
      firstName: config.primaryContactFirst,
      lastName: config.primaryContactLast,
      email: config.primaryContactEmail,
    },
    dmOnlyComms: config.dmOnlyComms,
    pricing: getPrice({
      users: config.userCount,
      districtDiscount: config.districtDiscount,
      legacyDiscount: config.legacyDiscount,
      insightsAddOn: config.insightsAddOn,
      rewardsAddOn: config.rewardsAddOn,
      rubricAddOn: config.rubricAddOn,
      slOnboardingAddOn: config.slOnboardingAddOn,
      teacherTrainingAddOn: config.teacherTrainingAddOn,
      planType: config.recommendedPlan,
      multiYear: Math.max(
        1,
        Math.min(
          config.subscriptionTerm ? Number(config.subscriptionTerm) : 1,
          5
        )
      ),
      showRecommendationMsg: shouldShowRecommendationMsg,
      debug: true,
    }),
    schoolName: config.schoolName,
    renewalDealId: config.renewalDealId,
    showOffer: config.showOffer,
  };
}

function fixNum(raw) {
  return Number(Number(raw).toFixed(2));
}

function getPrice({
  users,
  districtDiscount = config.districtDiscount,
  legacyDiscount = config.legacyDiscount,
  insightsAddOn = false,
  rewardsAddOn = false,
  rubricAddOn = false,
  slOnboardingAddOn = false,
  teacherTrainingAddOn = false,
  renewalDealId = config.renewalDealId,
  multiYear = 1,
  planType,
  showRecommendationMsg = true,
  debug = true,
}) {
  // Consolidate legacy discount logic based on currentPlan
  if (
    (config.currentPlan === "premiumPlus" ||
      config.currentPlan === "premium") &&
    originalRecommendedPlan === "premium" &&
    config.selectedPlan === "starter"
  ) {
    legacyDiscount = 0;
  } else if (config.selectedPlan === "premium") {
    legacyDiscount = config.legacyDiscount;
  }

  for (var p = 0; p < config.prices.length; p++) {
    if (users >= config.prices[p].staffCount) {
      var tier = config.prices[p];
      // check if there's a higher tier
      // check if the lowest price at this next tier is below the current price
      // if so, return the better offer
    }
  }

  const starterPerUser = tier.starterPerUser;
  const premiumPerUser = tier.premiumPerUser;
  const basePerUser = planType === "starter" ? starterPerUser : premiumPerUser;

  const addOnListPrice = Math.ceil(users * tier.insightsAddOn);

  const addons = {
    insightsAddOn: {
      enabled: insightsAddOn,
      visible: planType === "starter" ? true : false,
      included: planType === "premium",
      price: planType === "premium" ? 0 : insightsAddOn ? addOnListPrice : 0,
      listPrice: addOnListPrice,
    },
    rewardsAddOn: {
      enabled: rewardsAddOn,
      visible: planType === "starter" ? true : false,
      included: planType === "premium",
      price: planType === "premium" ? 0 : rewardsAddOn ? addOnListPrice : 0,
      listPrice: addOnListPrice,
    },
    rubricAddOn: {
      enabled: rubricAddOn,
      visible: planType === "starter" ? true : false,
      included: planType === "premium",
      price: planType === "premium" ? 0 : rubricAddOn ? addOnListPrice : 0,
      listPrice: addOnListPrice,
    },
    slOnboardingAddOn: {
      enabled: slOnboardingAddOn,
      visible: true,
      included: planType === "premium" ? true : false,
      price:
        planType === "premium" ? 0 : config.trainingPrices.slOnboardingAddOn,
      listPrice: config.trainingPrices.slOnboardingAddOn,
    },
    teacherTrainingAddOn: {
      enabled: teacherTrainingAddOn,
      visible: true,
      included: false,
      price: config.trainingPrices.teacherTrainingAddOn,
      listPrice: config.trainingPrices.teacherTrainingAddOn,
    },
  };

  const basePrice = fixNum(users * basePerUser);
  let softwareAddonPrice = 0;

  if (insightsAddOn) softwareAddonPrice += addons.insightsAddOn.price;
  if (rewardsAddOn) softwareAddonPrice += addons.rewardsAddOn.price;
  if (rubricAddOn) softwareAddonPrice += addons.rubricAddOn.price;

  let grossSoftwarePrice = fixNum(basePrice + softwareAddonPrice);

  let trainingAddonPrice = 0;

  if (slOnboardingAddOn) trainingAddonPrice += addons.slOnboardingAddOn.price;
  if (teacherTrainingAddOn)
    trainingAddonPrice += addons.teacherTrainingAddOn.price;

  const multiYearDiscount = config.multiYearDiscounts[multiYear];

  console.log(multiYearDiscount, legacyDiscount, districtDiscount);

  let totalDiscount =
    Number(Number(multiYearDiscount).toFixed(3)) +
    Number(Number(legacyDiscount).toFixed(3)) +
    Number(Number(districtDiscount).toFixed(3));
  totalDiscount = totalDiscount.toFixed(3);

  const legacyDiscountSavings = fixNum(grossSoftwarePrice * legacyDiscount);
  const districtDiscountSavings = fixNum(
    grossSoftwarePrice * districtDiscount
  ).toFixed(2);
  const multiYearSavings = fixNum(
    grossSoftwarePrice * multiYearDiscount
  ).toFixed(2);
  const totalSavings = fixNum(
    Number(legacyDiscountSavings) +
    Number(districtDiscountSavings) +
    Number(multiYearSavings)
  );

  //const totalDiscount = parseFloat((legacyDiscount + districtDiscount + config.multiYearDiscounts[multiYear]).toFixed(2));
  let softwarePrice = fixNum(
    grossSoftwarePrice -
    legacyDiscountSavings -
    districtDiscountSavings -
    multiYearSavings
  );

  const yearOneCost = fixNum(
    Number(softwarePrice) + Number(trainingAddonPrice)
  );
  const extraYearsCost = fixNum((multiYear - 1) * Number(softwarePrice));
  const price = fixNum(yearOneCost + extraYearsCost);

  //generate recommendation message, if applicable

  if (
    showRecommendationMsg &&
    planType == config.recommendedPlan &&
    rubricAddOn == config.rubricAddOn &&
    planType == "starter" &&
    config.currentPlan != "starter"
  ) {
    var recommendationMsg = null;

    if (
      config.currentPlan == "premium" ||
      config.currentPlan == "premiumPlus"
    ) {
      if (!rubricAddOn)
        recommendationMsg =
          "We've switched you to our new <span>Starter</span> plan to save money with the same great features! <a target='_blank' href='https://help.whyliveschool.com/en/articles/10370287-premium-to-starter'>Learn More</a>";
      else
        recommendationMsg =
          "We've switched you to our new <span>Starter with Unlimited Rubric</span> plan to save money with the same great features! <a target='_blank' href='https://help.whyliveschool.com/en/articles/10370302-premium-to-starter-w-unlimited-rubric'>Learn More</a>";
    }
    if (config.currentPlan.indexOf("Lite") > -1) {
      var planText =
        config.currentPlan == "rewardsLite"
          ? "Rewards Lite"
          : "House Points Lite";
      if (config.rubricAddOn)
        recommendationMsg =
          "The <span>" +
          planText +
          "</span> plan is no longer offered, so we've switched you to our new Starter plan with Unlimited Rubric. <a target='_blank' href='https://help.whyliveschool.com/en/articles/10370318-lite-to-starter-with-unlimited-rubric'>Learn More</a>";
      else
        recommendationMsg =
          "We've switched you to our new <span>Starter</span> plan to unlock more features at the same price! <a target='_blank' href='https://help.whyliveschool.com/en/articles/10370312-lite-to-starter'>Learn More</a>";
    }
  }

  if (debug) {
    console.log(
      "$" +
      basePrice +
      ": Base for " +
      users +
      " at " +
      basePerUser +
      "/user on " +
      planType +
      "\n+" +
      "$" +
      softwareAddonPrice +
      " for software addons\n" +
      "=$" +
      grossSoftwarePrice +
      " gross for software\n\n" +
      totalDiscount * 100 +
      "% Total Discount ($" +
      totalSavings +
      "):\n  " +
      multiYearDiscount * 100 +
      "% Multi-Year Discount ($" +
      multiYearSavings +
      ")\n  " +
      legacyDiscount * 100 +
      "% Legacy Discount ($" +
      legacyDiscountSavings +
      ")\n  " +
      districtDiscount * 100 +
      "% District Discount ($" +
      districtDiscountSavings +
      ")\n\n" +
      "=$" +
      softwarePrice +
      " for software after discounts\n\n" +
      "+$" +
      trainingAddonPrice +
      " for training addons\n" +
      "=$" +
      yearOneCost +
      " year 1 cost for software & training\n\n" +
      (multiYear == 1
        ? ""
        : "For a total term of " +
        multiYear +
        " year/s\n" +
        "+$" +
        extraYearsCost +
        " for " +
        (multiYear - 1) +
        " additional years at $" +
        softwarePrice +
        "/year (software only)\n\n" +
        "=$" +
        price)
    );
  }

  var exportToHiddenFormFields = {
    "Selected Plan": planType,
    Total: price,
    "Company ID": config.companyId,
    "Renewal Deal ID": renewalDealId,
    Experience: (function () {
      try {
        return window.self !== window.top ? "in-app" : "web";
      } catch (e) {
        return "in-app";
      }
    })(),
    Email: config.email,
    "Number of staff": users,
    Insights: insightsAddOn,
    Rewards: rewardsAddOn,
    "Unlimited Rubric": rubricAddOn,
    "Admin Onboarding": slOnboardingAddOn,
    "Teacher Training": teacherTrainingAddOn,
    "Subscription Term": multiYear,
    "District Dicount": config.districtDiscount,
    "Legacy Discount":
      (config.currentPlan === "premiumPlus" ||
        config.currentPlan === "premium") &&
        originalRecommendedPlan === "premium" &&
        config.selectedPlan === "starter"
        ? 0
        : config.selectedPlan === "premium"
          ? config.legacyDiscount
          : legacyDiscount,
  };

  config.formIDs.forEach((formID) => {
    const form = document.getElementById(formID);
    if (!form) return; // Skip if the form does not exist

    Object.entries(exportToHiddenFormFields).forEach(([key, value]) => {
      let hiddenField = form.querySelector(
        `input[type="hidden"][name="${key}"]`
      );

      if (hiddenField) {
        // Update the value if the hidden field exists
        hiddenField.value = value;
      } else {
        // Create a new hidden field if it does not exist
        hiddenField = document.createElement("input");
        hiddenField.type = "hidden";
        hiddenField.name = key;
        hiddenField.value = value;
        form.appendChild(hiddenField);
      }
    });
  });

  var returnData = {
    price: formatPrice(price),
    recommendationMsg,
    addons,
    currentPlan: config.currentPlan,
    recommendedPlan: planType,
    multiYear: multiYear,
    subtotals: {
      softwareAddonPrice,
      trainingAddonPrice,
      yearOneCost,
      extraYearsCost,
      basePerUser,
    },
    discounts: {
      grossSoftwarePrice,
      legacyDiscountSavings: legacyDiscountSavings,
      districtDiscountSavings: districtDiscountSavings,
      multiYearSavings: multiYearSavings,
      totalDiscount,
      districtDiscount,
      legacyDiscount,
      multiYearDiscount: multiYearDiscount,
      totalSavings,
    },
    perUserPrices: {
      listPriceStarterPerUser: starterPerUser,
      listPricePremiumPerUser: premiumPerUser,
      starterPerUser: fixNum(starterPerUser - starterPerUser * totalDiscount),
      premiumPerUser: fixNum(premiumPerUser - premiumPerUser * totalDiscount),
    },
    priceBreakOpportunities: checkPriceBreakOpportunities({
      addons,
      users,
      districtDiscount,
      legacyDiscount,
      planType,
      multiYear,
    }),
  };

  if (debug) console.log(JSON.stringify(returnData, null, 2));

  return returnData;
}

// Example usage:
/*getPrice({
    users: 50,
    districtDiscount: 0.1,
    legacyDiscount: 0.05,
    insightsAddOn: true,
    rewardsAddOn: true,
    rubricAddOn: false,
    slOnboardingAddOn: false,
    teacherTrainingAddOn : false,
    multiYear: 3,
    planType: 'premium',
    currentPlan: "premium"
});
*/

// GET URL QUERY PARAMS
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// FORMAT PRICE
function formatPrice(price) {
  var price = "$" + formatMoney(price, 2);
  price = price.toString();
  if (price.slice(-2) == "00") price = price.substring(0, price.length - 3);
  return price;
}

function formatMoney(number, decPlaces, decSep, thouSep) {
  (decPlaces = isNaN((decPlaces = Math.abs(decPlaces))) ? 2 : decPlaces),
    (decSep = typeof decSep === "undefined" ? "." : decSep);
  thouSep = typeof thouSep === "undefined" ? "," : thouSep;
  var sign = number < 0 ? "-" : "";
  var i = String(
    parseInt((number = Math.abs(Number(number) || 0).toFixed(decPlaces)))
  );
  var j = (j = i.length) > 3 ? j % 3 : 0;

  return (
    sign +
    (j ? i.substr(0, j) + thouSep : "") +
    i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
    (decPlaces
      ? decSep +
      Math.abs(number - i)
        .toFixed(decPlaces)
        .slice(2)
      : "")
  );
}

function checkPriceBreakOpportunities(currentParams) {
  let currentTierIndex = -1;

  for (let i = 0; i < config.prices.length - 1; i++) {
    const currentTier = config.prices[i];
    const nextTier = config.prices[i + 1];

    if (
      currentParams.users >= currentTier.staffCount &&
      currentParams.users < nextTier.staffCount
    ) {
      currentTierIndex = i;
      break;
    }
  }

  if (currentTierIndex === -1 || currentTierIndex >= config.prices.length - 1)
    return null;

  const opportunities = [];

  const nextTier = config.prices[currentTierIndex + 1];
  const currentTier = config.prices[currentTierIndex];

  const priceKey =
    currentParams.planType === "premium" ? "premiumPerUser" : "starterPerUser";

  const currentBasePrice = currentParams.users * currentTier[priceKey];
  const nextTierBasePrice = nextTier.staffCount * nextTier[priceKey];

  let currentAddonPrice = 0;
  let nextTierAddonPrice = 0;

  if (
    currentParams.addons.insightsAddOn.enabled &&
    currentParams.addons.insightsAddOn.price != 0
  ) {
    currentAddonPrice += Math.ceil(
      currentParams.users * currentTier.insightsAddOn
    );
    nextTierAddonPrice += Math.ceil(
      nextTier.staffCount * nextTier.insightsAddOn
    );
  }

  if (
    currentParams.addons.rewardsAddOn.enabled &&
    currentParams.addons.rewardsAddOn.price != 0
  ) {
    currentAddonPrice += Math.ceil(
      currentParams.users * currentTier.rewardsAddOn
    );
    nextTierAddonPrice += Math.ceil(
      nextTier.staffCount * nextTier.rewardsAddOn
    );
  }

  if (
    currentParams.addons.rubricAddOn.enabled &&
    currentParams.addons.rubricAddOn.price != 0
  ) {
    currentAddonPrice += Math.ceil(
      currentParams.users * currentTier.rubricAddOn
    );
    nextTierAddonPrice += Math.ceil(nextTier.staffCount * nextTier.rubricAddOn);
  }

  if (
    currentParams.addons.slOnboardingAddOn.enabled &&
    !currentParams.addons.slOnboardingAddOn.included
  ) {
    currentAddonPrice += config.trainingPrices.slOnboardingAddOn;
    nextTierAddonPrice += config.trainingPrices.slOnboardingAddOn;
  }
  if (
    currentParams.addons.teacherTrainingAddOn.enabled &&
    !currentParams.addons.teacherTrainingAddOn.included
  ) {
    currentAddonPrice += config.trainingPrices.teacherTrainingAddOn;
    nextTierAddonPrice += config.trainingPrices.teacherTrainingAddOn;
  }

  const currentTotal = currentBasePrice + currentAddonPrice;
  const nextTierTotal = nextTierBasePrice + nextTierAddonPrice;

  const totalDiscount =
    Number(currentParams.districtDiscount || "0") +
    Number(currentParams.legacyDiscount || "0") +
    Number(config.multiYearDiscounts[currentParams.multiYear || 1] || 0);

  const currentCost = currentTotal * (1 - totalDiscount);
  const newCost = nextTierTotal * (1 - totalDiscount);

  const multiYear = currentParams.multiYear || 1;
  const totalCurrentCost = currentCost * multiYear;
  const totalNewCost = newCost * multiYear;

  if (totalNewCost < totalCurrentCost) {
    opportunities.push({
      nextTierUsers: nextTier.staffCount,
      additionalUsers: nextTier.staffCount - currentParams.users,
      currentCost: totalCurrentCost,
      newCost: totalNewCost,
      savings: totalCurrentCost - totalNewCost,
      currentPricePerUser: formatMoney(currentCost / currentParams.users),
      newPricePerUser: formatMoney(newCost / nextTier.staffCount),
      multiYear,
      annualSavings: (totalCurrentCost - totalNewCost) / multiYear,
    });
  }

  return opportunities.length > 0 ? opportunities : null;
}

/*
/* ========== SEPARATION OF RENEWAL AND CANCELLATION LOGIC ========== */
function getPathAfterSlash(url) {
  const urlObj = new URL(url);
  return urlObj.pathname.substring(1);
}

let renewalDealId;

// Determine if Renewal Deal ID is already won, lost or open
function handleUrlRoute(url) {
  //   const path = getPathAfterSlash(url);
  //   renewalDealId = getParameterByName("renewalDealId");
  //   // First check webhook status
  //   fetch("https://hook.us1.make.com/i6ulb3tp4vmbjtibarokb1wzeiajm1nv", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ renewalDealId: renewalDealId }),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       // Store webhook status
  //       const status = data.status || "open";
  //       if (status === "won") {
  //         console.log("Deal is won");
  //         handleRenewalWon();
  //       } else if (status === "lost") {
  //         console.log("Deal is lost");
  //         handleRenewalLost();
  //       } else {
  //         console.log("Deal is open or undefined");
  //         routeBasedOnPath(path);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching webhook:", error);
  //       // Continue with normal flow on error
  //       routeBasedOnPath(path);
  //     });
  const path = getPathAfterSlash(url);
  routeBasedOnPath(path);
  return true;
}

// Extract the path-based routing to a separate function
function routeBasedOnPath(path) {
  // Check if path contains these strings instead of exact matches
  //   if (path.includes("renewal-calculator")) {
  //     handleRenewal();
  //   } else if (path.includes("renewal-cancellation")) {
  //     handleCancellation();
  //   }
  handleRenewal();
}

function handleCancellation() {
  runCancellationLogic();
}

function handleRenewal() {
  runRenewalLogic();
}

function handleRenewalWon() {
  const renewalDealWrapper = document.getElementById("renewal-calc__deal--won");
  const renewalDealForm = document.getElementById(
    "renewal-calc__deal--won-form"
  );
  const renewalDealFormSuccess = document.querySelector(
    ".renewal__deal-status.won .w-form-done"
  );
  const renewalDealSuccessMsg = document.getElementById(
    "renewal-calc__deal-won-success"
  );
  const renewalDealIDEelement = document.getElementById("renewal-won__deal-id");

  // Populate Renewal Deal ID
  renewalDealIDEelement.value = renewalDealId;

  console.log(renewalDealId);

  // Show the "Deal Won" message element
  renewalDealWrapper.classList.add("visible");

  // Form success message observer to trigger confirmation message
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.style.display === "block") {
        renewalDealForm.style.display = "none";
        renewalDealSuccessMsg.style.display = "flex";
        observer.disconnect();
      }
    });
  });

  if (renewalDealFormSuccess) {
    observer.observe(renewalDealFormSuccess, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }
}

function handleRenewalLost() {
  const renewalDealWrapper = document.getElementById(
    "renewal-calc__deal--lost"
  );
  const renewalDealForm = document.getElementById(
    "renewal-calc__deal--lost-form"
  );
  const renewalDealFormSuccess = document.querySelector(
    ".renewal__deal-status.lost .w-form-done"
  );
  const renewalDealSuccessMsg = document.getElementById(
    "renewal-calc__deal-lost-success"
  );
  const renewalDealIDEelement = document.getElementById(
    "renewal-lost__deal-id"
  );

  // Populate Renewal Deal ID
  renewalDealIDEelement.value = renewalDealId;

  // Show the "Deal Won" message element
  renewalDealWrapper.classList.add("visible");

  // Form success message observer to trigger confirmation message
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.style.display === "block") {
        renewalDealForm.style.display = "none";
        renewalDealSuccessMsg.style.display = "flex";
        observer.disconnect();
      }
    });
  });

  if (renewalDealFormSuccess) {
    observer.observe(renewalDealFormSuccess, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }
}

const currentUrl = window.location.href;
handleUrlRoute(currentUrl);

/*
/* ========== RENEWAL CALCULATOR LOGIC ========== */
function runRenewalLogic() {
  /*
  /* ========== MAIN FORM VARIABLES ========== */
  const emailFormSuccessMsg = document.querySelector(".success-message-5");
  const emailForm = document.getElementById("wf-form-Renewal-Email-PDF-Quote");
  const stepOneTab = document.getElementById("renewal-form__step-1--tab");
  const stepTwoTab = document.getElementById("renewal-form__step-2--tab");
  const stepOneTabText = document.getElementById(
    "renewal-form__step-1--tab-text"
  );
  const stepTwoTabText = document.getElementById(
    "renewal-form__step-2--tab-text"
  );
  const goToStepOne = document.getElementById("renewal-form__step-1--trigger");
  const goToStepTwo = document.getElementById("renewal-form__step-2--trigger");
  const submitFormButton = document.getElementById("submit-form-button");
  const formStepOne = document.getElementById("renewal-form__step-1");
  const formStepTwo = document.getElementById("renewal-form__step-2");
  const planSwitchBlock = document.getElementById(
    "renewal-form__plan-switcher"
  );
  const recommendedPlanMessage = document.getElementById(
    "renewal-form__message"
  );
  const invoiceDateContainer = document.getElementById(
    "renewal-form__invoice-date"
  );
  const invoiceDateMonth = document.getElementById(
    "renewal-form__invoice-month"
  );
  const invoiceDateDay = document.getElementById("renewal-form__invoice-day");
  const invoiceDateYear = document.getElementById("renewal-form__invoice-year");

  // Upsell modal
  const rewardsCheckbox = document.getElementById("renewal-form__addon--rewards");
  const upsellModal = document.getElementById("upsell-modal");
  const upsellTotal = document.getElementById("upsell-total");

  function showUpsellModal() {
    upsellModal.classList.add("visible");
    document.body.style.overflow = "hidden";
    const newTotal = calculateUpsellTotal();
    upsellTotal.textContent = newTotal;
  }

  function calculateUpsellTotal() {
    // Get current pricing configuration
    const users = parseInt(document.getElementById("renewal-form__users").value) || 0;
    const subscriptionTerm = document.getElementById("renewal-form__subscription-term");
    const multiYear = subscriptionTerm ? parseInt(subscriptionTerm.value) : 1;
    
    // Calculate what the price would be with rewards addon enabled
    const pricingDataWithRewards = {
      users: users,
      planType: planSwitcher.currentPlan,
      multiYear: multiYear,
      insightsAddOn: document.getElementById("renewal-form__addon--insights")?.checked || false,
      rewardsAddOn: true,
      rubricAddOn: document.getElementById("renewal-form__addon--unlimited-rubric")?.checked || false,
      slOnboardingAddOn: document.getElementById("renewal-form__addon--admin-onboarding")?.checked || false,
      teacherTrainingAddOn: document.getElementById("renewal-form__addon--teacher-training")?.checked || false,
    };
    
    const newPriceData = getPrice(pricingDataWithRewards);
    return newPriceData.price;
  }

  // Savings tooltip
  const savingsTooltip = document.getElementById(
    "renewal-form__savings-tooltip"
  );
  const savingsUsers = document.getElementById("actions__savings-user-count");
  const savingsValue = document.getElementById("actions__savings-value");
  const usersField = document.getElementById("renewal-form__users");
  const increaseBtn = document.getElementById("action__savings-apply");
  const modalOverlay = document.getElementById("modal-overlay");

  // Recommendation message variable
  let hasRecommendedMsg;

  /*
  /* ========== MAIN POPULATING FUNCTION ========== */
  function populateFields(configData) {
    populateDynamicFields(configData);
    // Only populate static fields if this is the initial population
    if (configData.primaryContact) {
      populateStaticFields(configData);
    }
  }

  /*
  /* ========== POPULATE FIELDS ON LOAD ========== */

  function populateStaticFields(configData) {
    // Populate static fields that don't need to be updated with price changes
    if (document.getElementById("renewal-form__contact-firstname"))
      document.getElementById("renewal-form__contact-firstname").value =
        configData.primaryContact.firstName;
    if (document.getElementById("renewal-form__contact-lastname"))
      document.getElementById("renewal-form__contact-lastname").value =
        configData.primaryContact.lastName;
    if (document.getElementById("renewal-form__contact-email"))
      document.getElementById("renewal-form__contact-email").value =
        configData.primaryContact.email;
    if (document.getElementById("renewal-form__current-plan"))
      document.getElementById("renewal-form__current-plan").textContent =
        configData.pricing.recommendedPlan;
    if (document.getElementById("renewal-form__step-heading__staff"))
      document.getElementById("renewal-form__step-heading__staff").textContent =
        configData.users;
    if (document.getElementById("submit-form-button--checker")) {
      document.getElementById("submit-form-button--checker").style.display =
        "none";
    }
    if (document.getElementById("renewal-form__dealId")) {
      document.getElementById("renewal-form__dealId").textContent =
        configData.renewalDealId;
    }
    if (document.getElementById("renewal-form__school-name")) {
      document.getElementById("renewal-form__school-name").textContent =
        configData.schoolName;
    }

    // Populate "Experience" field based on where the Renewal calculator was loaded (web or in-app)
    const renewalExperience = document.getElementById(
      "renewal-form__experience"
    );
    try {
      if (window.self !== window.top) {
        renewalExperience.value = "in-app";
      } else {
        renewalExperience.value = "web";
      }
    } catch (e) {
      renewalExperience.value = "in-app";
    }

    // Populate Legacy and District discount to hidden form inputs
    if (document.getElementById("renewal-form__legacy-discount")) {
      document.getElementById("renewal-form__legacy-discount").value =
        configData.pricing.discounts.legacyDiscount || 0;
    }
    if (document.getElementById("renewal-form__district-discount")) {
      document.getElementById("renewal-form__district-discount").value =
        configData.pricing.discounts.districtDiscount || 0;
    }

    // Populate Subscription term
    if (configData.pricing.multiYear) {
      const subscriptionTermDropdown = document.getElementById(
        "renewal-form__subscription-term"
      );
      if (configData.pricing.multiYear > 5) {
        subscriptionTermDropdown.value = 5;
      } else {
        subscriptionTermDropdown.value = configData.pricing.multiYear;
      }
    }

    // Show Savings tooltip based on priceBreakOpportunities value
    if (configData.pricing.priceBreakOpportunities != null) {
      const priceBreakData = configData.pricing.priceBreakOpportunities;
      savingsTooltip.classList.add("active");
      modalOverlay.classList.add("active");
      savingsUsers.textContent = priceBreakData[0].nextTierUsers;
      savingsValue.textContent = formatPrice(priceBreakData[0].savings);
    }

    // Populate the tooltip for Email PDF Quote
    const tooltip = document.getElementById("renewal-form__email-tooltip");
    const tooltipText = document.getElementById("tooltip-text");
    const userEmail = document.getElementById("userEmail");

    if (configData.dmOnlyComms === true) {
      if (userEmail) {
        userEmail.textContent = configData.thisUsersEmail;
      }
    } else {
      if (userEmail) {
        userEmail.remove();
      }
      if (tooltipText) {
        tooltip.style.minWidth = "352px";
        tooltipText.textContent =
          "We'll email a PDF copy of this quote to all renewal contacts at your school.";
      }
    }

    // Populate per-user prices if they exist in initial config
    if (configData.pricing?.perUserPrices) {
      if (document.getElementById("renewal-form__starterPerUser")) {
        document.getElementById(
          "renewal-form__starterPerUser"
        ).textContent = `$${configData.pricing.perUserPrices.listPriceStarterPerUser}`;
      }
      if (document.getElementById("renewal-form__premiumPerUser")) {
        document.getElementById(
          "renewal-form__premiumPerUser"
        ).textContent = `$${configData.pricing.perUserPrices.listPricePremiumPerUser}`;
      }
    }

    // Populate hidden Plan, Total and Renewal Deal ID fields
    if (document.getElementById("renewal-form__selected-plan")) {
      document.getElementById("renewal-form__selected-plan").value =
        configData.pricing.recommendedPlan;
    }
    if (document.getElementById("renewal-form__quote")) {
      const quoteElement = document.getElementById("renewal-form__quote");
      quoteElement.value = configData.pricing.price;
    }
    if (document.getElementById("renewal-form__renewal-id")) {
      document.getElementById("renewal-form__renewal-id").value =
        configData.renewalDealId;
    }

    // Populate tomorrow's date on Invoice Date fieldsx
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const estOptions = { timeZone: "America/New_York" };
    const estDate = tomorrow.toLocaleDateString("en-US", estOptions);
    const [month, day, year] = estDate.split("/");

    invoiceDateMonth.value = month;
    invoiceDateDay.value = day;
    invoiceDateYear.value = year;

    // Populate label of plans messages that appear on plan box hover
    const planHoverMessages = document.querySelectorAll(
      ".pricing-plan__message"
    );
    planHoverMessages.forEach((plan) => {
      const messageText = plan.querySelector(".pricing-plan__message-text");

      if (
        configData.showProratedDiscounts === null ||
        configData.showProratedDiscounts === undefined
      ) {
        plan.classList.add("active--no-msg");
        plan.parentElement.classList.add("active--no-msg");
      } else {
        messageText.textContent = configData.showProratedDiscounts;
      }
    });

    // Populate discount values
    const discountElement = document.getElementById(
      "renewal-form__discount-number"
    ); // Discount value in final quote

    const discountPlans = document.querySelectorAll(
      ".renewal-form__discount-plans"
    ); // Discount value in plan cards

    if (discountElement) {
      discountElement.textContent = (
        parseFloat(discountElement.textContent) * 100
      ).toFixed(1);
    }

    discountPlans.forEach((plan) => {
      plan.textContent = (parseFloat(plan.textContent) * 100).toFixed(1);
    });

    const discountValue = (
      configData.pricing.discounts.totalDiscount * 100
    ).toFixed(1);

    if (discountValue <= 0 || discountValue === null) {
      discountElement.parentElement.style.display = "none";
      discountPlans.forEach((plan) => {
        plan.textContent = discountValue;
      });
    } else {
      discountElement.textContent = discountValue;
      discountPlans.forEach((plan) => {
        plan.textContent = discountValue;
      });
    }

    // Current plan tag functionality
    const recommendedPlan = configData.pricing.recommendedPlan;

    if (recommendedPlan === "premium") {
      document.getElementById("renewal-form__step-heading__plan").textContent =
        "Premium plan";
    } else if (recommendedPlan === "starter") {
      document.getElementById("renewal-form__step-heading__plan").textContent =
        "Starter plan";
    }

    // Upsell modal functionality
    function setupUpsellModal() {
      const upsellClose = document.getElementById("upsell-close");
      const upsellConfirm = document.getElementById("upsell-confirm");
      const upsellDeny = document.getElementById("upsell-deny");

      window.playVideo = function () {
        const videoContainer = document.querySelector('#upsell-modal .r360-hero__video-container');
        const thumbnail = document.querySelector('#upsell-modal .video-thumbnail');
        const iframeContainer = document.querySelector('#upsell-modal #iframeContainer');

        if (!iframeContainer || !thumbnail || !videoContainer) {
          console.error('Could not find video elements');
          return;
        }

        videoContainer.style.display = 'block';
        thumbnail.style.display = 'none';
        iframeContainer.style.display = 'block';

        iframeContainer.innerHTML = `
          <style>
            wistia-player[media-id='01qtcanx93']:not(:defined) {
              background: center / contain no-repeat url(https://fast.wistia.com/embed/medias/01qtcanx93/swatch);
              border-radius: 0px;
              display: block;
              filter: blur(5px);
              padding-top: 56.25%;
            }
            wistia-player[media-id='01qtcanx93']:state(--initializing) {
              background: center / contain no-repeat url(https://fast.wistia.com/embed/medias/01qtcanx93/swatch);
              border-radius: 0px;
              display: block;
              filter: blur(5px);
              padding-top: 56.25%;
            }
          </style>
          <wistia-player 
            media-id="01qtcanx93" 
            aspect="1.7777777777777777" 
            do-not-track="false" 
            embed-host="fast.wistia.com"
            autoplay="true"
            style="width: 100%; height: 100%;">
          </wistia-player>
        `;

        // Load Wistia script if not already loaded
        if (!window.Wistia) {
          const script = document.createElement('script');
          script.src = 'https://fast.wistia.com/assets/external/E-v1.js';
          script.async = true;
          document.head.appendChild(script);
        }
      };

      function hideUpsellModal() {
        upsellModal.classList.remove("visible");
        document.body.style.overflow = "";

        // Reset video embed
        const thumbnail = upsellModal.querySelector('.video-thumbnail');
        const iframeContainer = upsellModal.querySelector('#iframeContainer');
        if (thumbnail && iframeContainer) {
          thumbnail.style.display = 'block';
          iframeContainer.style.display = 'none';
          iframeContainer.innerHTML = '';
        }
      }

      // Check if we should show modal when going to step 2
      const originalGoToStepTwo = goToStepTwo.onclick;
      goToStepTwo.onclick = function (e) {
        const currentPlan = planSwitcher.currentPlan;
        const isRewardsChecked = rewardsCheckbox ? rewardsCheckbox.checked : false;

        // Show modal if on starter plan and rewards not selected
        if (currentPlan === "starter" && !isRewardsChecked) {
          e.preventDefault();
          showUpsellModal();
        } else {
          // Proceed normally
          displayFormStepTwo();
        }
      };

      // Close button
      upsellClose.addEventListener("click", () => {
        hideUpsellModal();
        displayFormStepTwo();
      });

      // Deny button
      upsellDeny.addEventListener("click", () => {
        hideUpsellModal();
        displayFormStepTwo();
      });

      // Confirm button - add rewards addon and proceed
      upsellConfirm.addEventListener("click", () => {
        if (rewardsCheckbox) {
          rewardsCheckbox.checked = true;
          // Trigger change event to update pricing
          rewardsCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
        hideUpsellModal();
        displayFormStepTwo();
      });
    }

    // Initialize upsell modal
    setupUpsellModal();

    // Recommendation message on top
    const recommendationMessage = document.getElementById(
      "renewal-form__message"
    );
    if (
      configData.pricing.recommendationMsg === null ||
      configData.pricing.recommendationMsg === undefined
    ) {
      hasRecommendedMsg = false;
      recommendationMessage.classList.add("unset");
    } else {
      hasRecommendedMsg = true;
      recommendationMessage.innerHTML = `<p class="renewal__form-message-text">${configData.pricing.recommendationMsg}</p>`;

      const messageSpan = recommendationMessage.querySelector("span");
      const messageLink = recommendationMessage.querySelector("a");

      if (messageSpan) {
        messageSpan.classList.add("renewal__form-message-span");
      }
      if (messageLink) {
        messageLink.classList.add("renewal__form-message-link");
      }
    }

    // Add price labels update
    const addonPriceLabels = {
      "renewal-form__addon--insights--price":
        configData.pricing.addons.insightsAddOn.listPrice,
      "renewal-form__addon--rewards--price":
        configData.pricing.addons.rewardsAddOn.listPrice,
      "renewal-form__addon--unlimited-rubric--price":
        configData.pricing.addons.rubricAddOn.listPrice,
      "renewal-form__addon--admin-onboarding--price":
        configData.pricing.addons.slOnboardingAddOn.listPrice,
      "renewal-form__addon--teacher-training--price":
        configData.pricing.addons.teacherTrainingAddOn.listPrice,
    };

    // Update each price label
    Object.entries(addonPriceLabels).forEach(([labelId, price]) => {
      const label = document.getElementById(labelId);
      if (label) {
        label.textContent = `+$${price}`;
      }
    });

    // Plan highlighting
    function handleInitialPlanHighlighting() {
      const currentValue = document.getElementById(
        "renewal-form__current-plan"
      ).textContent;
      const planTagStarter = document
        .getElementById("edit-plan__starter-container")
        .querySelector(".plan__tag");
      const planTagPremium = document
        .getElementById("edit-plan__premium-container")
        .querySelector(".plan__tag");
      if (currentValue === "premium") {
        planTagStarter.classList.remove("visible");
        planTagPremium.classList.add("visible");
      } else if (currentValue === "starter") {
        planTagStarter.classList.add("visible");
        planTagPremium.classList.remove("visible");
      }
    }

    handleInitialPlanHighlighting();
  }

  /*
/* ========== POPULATE FIELDS ON INPUT CHANGE ========== */

  function populateDynamicFields(configData) {
    // Plan details - dropdown for multiYear (values 1-5)
    const subscriptionTerm = document.getElementById(
      "renewal-form__subscription-term"
    );
    if (subscriptionTerm && configData.pricing.multiYear !== undefined) {
      subscriptionTerm.value = configData.pricing.multiYear;
    }

    // Populate discount values
    const discountElement = document.getElementById(
      "renewal-form__discount-number"
    );
    const discountPlans = document.querySelectorAll(
      ".renewal-form__discount-plans"
    );

    if (configData.pricing?.discounts?.totalDiscount !== undefined) {
      const discountValue = (
        configData.pricing.discounts.totalDiscount * 100
      ).toFixed(1);

      if (discountValue <= 0 || discountValue === null) {
        if (discountElement?.parentElement) {
          discountElement.parentElement.style.display = "none";
        }
        discountPlans.forEach((plan) => {
          plan.textContent = discountValue;
        });
      } else {
        if (discountElement?.parentElement) {
          discountElement.parentElement.style.display = "block";
        }
        if (discountElement) {
          discountElement.textContent = discountValue;
        }
        discountPlans.forEach((plan) => {
          plan.textContent = discountValue;
        });
      }
    }

    // Update per-user prices if they've changed
    if (configData.pricing?.perUserPrices) {
      if (document.getElementById("renewal-form__starterPerUser")) {
        const newPrice =
          configData.pricing.perUserPrices.listPriceStarterPerUser;
        if (newPrice) {
          document.getElementById(
            "renewal-form__starterPerUser"
          ).textContent = `$${newPrice}`;
        }
      }
      if (document.getElementById("renewal-form__premiumPerUser")) {
        const newPrice =
          configData.pricing.perUserPrices.listPricePremiumPerUser;
        if (newPrice) {
          document.getElementById(
            "renewal-form__premiumPerUser"
          ).textContent = `$${newPrice}`;
        }
      }
    }

    // Regular input fields
    if (document.getElementById("renewal-form__previous-plan"))
      document.getElementById("renewal-form__previous-plan").textContent =
        configData.pricing.currentPlan;
    if (document.getElementById("renewal-form__quote-display"))
      document.getElementById(
        "renewal-form__quote-display"
      ).textContent = `${configData.pricing.price}`;
    if (document.getElementById("renewal-form__users"))
      document.getElementById("renewal-form__users").value = configData.users;

    // Populate hidden Plan and Total fields
    if (document.getElementById("renewal-form__selected-plan"))
      document.getElementById("renewal-form__selected-plan").value =
        configData.pricing.recommendedPlan;

    if (document.getElementById("renewal-form__quote"))
      document.getElementById("renewal-form__quote").value =
        configData.pricing.price;

    // Add-ons - checkboxes with visibility and enabled state
    const addons = {
      "renewal-form__addon--insights": configData.pricing.addons.insightsAddOn,
      "renewal-form__addon--rewards": configData.pricing.addons.rewardsAddOn,
      "renewal-form__addon--unlimited-rubric":
        configData.pricing.addons.rubricAddOn,
      "renewal-form__addon--admin-onboarding":
        configData.pricing.addons.slOnboardingAddOn,
      "renewal-form__addon--teacher-training":
        configData.pricing.addons.teacherTrainingAddOn,
    };

    // Hide Software Addons if none of them are visible
    const softwareAddonsContainer = document.getElementById(
      "renewal-form__software-addons"
    );
    const softwareAddonIds = [
      "renewal-form__addon--insights",
      "renewal-form__addon--rewards",
      "renewal-form__addon--unlimited-rubric",
    ];

    const allSoftwareAddonIdsHidden = softwareAddonIds.every(
      (id) => !addons[id].visible
    );

    if (allSoftwareAddonIdsHidden) {
      softwareAddonsContainer.classList.add("hidden");
    } else {
      softwareAddonsContainer.classList.remove("hidden");
    }

    // Add users value to Form step 2 heading
    if (document.getElementById("renewal-form__step-heading__staff"))
      document.getElementById("renewal-form__step-heading__staff").textContent =
        configData.users;

    // Set checkbox states and parent visibility
    Object.entries(addons).forEach(([id, addonData]) => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        // Get the parent container and set its visibility
        const parentContainer = checkbox.parentElement;
        if (parentContainer) {
          parentContainer.style.display = addonData.visible ? "flex" : "none";
        }
        // Set checked state
        checkbox.checked = addonData.enabled;

        if (!addonData.enabled) {
          parentContainer.classList.remove("checked");
        }

        // Disable interaction of the included addon
        if (addonData.included) {
          if (
            addonData.listPrice !== undefined ||
            addonData.listPrice !== null
          ) {
            parentContainer.querySelector(".addonprice").textContent = "Free";

            const parentElements = [
              "addon__title",
              "addon__description",
              "addonprice",
              "addon__checkbox-custom",
              "addon__checkbox-icon",
            ];
            parentElements.forEach((className) => {
              const element = parentContainer.querySelector(`.${className}`);
              if (element) {
                element.classList.add("checked");
              }
            });
            parentContainer.classList.add("checked");
            parentContainer
              .querySelector(".addon__checkbox-icon")
              .classList.add("checked");
            checkbox.checked = addonData.included;
            parentContainer.style.pointerEvents = "none";
            parentContainer.parentElement.style.cursor = "not-allowed";
          }
        }
      }
    });
  }

  /*
/* ========== PRICE CALCULATION ========== */

  function calculatePricingData(includeAddons = true) {
    const subscriptionTerm = document.getElementById(
      "renewal-form__subscription-term"
    );
    const users = document.getElementById("renewal-form__users");
    const currentPlan = document.getElementById("renewal-form__current-plan");

    const baseData = {
      users: users ? parseInt(users.value) : 0,
      recommendedPlan: currentPlan.textContent,
      multiYear: subscriptionTerm ? parseInt(subscriptionTerm.value) : 1,
      planType: planSwitcher.currentPlan,
    };

    // Always include addon data, but set values based on includeAddons parameter
    const addonData = {
      insightsAddOn: includeAddons
        ? document.getElementById("renewal-form__addon--insights")?.checked ||
        false
        : false,
      rewardsAddOn: includeAddons
        ? document.getElementById("renewal-form__addon--rewards")?.checked ||
        false
        : false,
      rubricAddOn: includeAddons
        ? document.getElementById("renewal-form__addon--unlimited-rubric")
          ?.checked || false
        : false,
      slOnboardingAddOn: includeAddons
        ? document.getElementById("renewal-form__addon--admin-onboarding")
          ?.checked || false
        : false,
      teacherTrainingAddOn: includeAddons
        ? document.getElementById("renewal-form__addon--teacher-training")
          ?.checked || false
        : false,
    };

    return {
      ...baseData,
      ...addonData,
    };
  }

  /*
  /* ========== UPDATE PRICING DATA ========== */

  function updatePricing(event) {
    const isPlanChange =
      event?.target?.id?.startsWith("edit-plan") ||
      (event?.type === "planChange" && !event.detail?.isInitialLoad);

    if (isPlanChange) {
      // Get stored states for the plan we're switching to
      const storedStates =
        planSwitcher.addonStates[planSwitcher.currentPlan] || {};

      const pricingData = {
        ...calculatePricingData(false),
        insightsAddOn: storedStates["renewal-form__addon--insights"] || false,
        rewardsAddOn: storedStates["renewal-form__addon--rewards"] || false,
        rubricAddOn:
          storedStates["renewal-form__addon--unlimited-rubric"] || false,
        slOnboardingAddOn:
          storedStates["renewal-form__addon--admin-onboarding"] || false,
        teacherTrainingAddOn:
          storedStates["renewal-form__addon--teacher-training"] || false,
      };

      const newPriceData = getPrice(pricingData);

      // Get fresh config data when switching plans - ensure enabled states are false
      const newConfigData = {
        pricing: {
          multiYear: pricingData.multiYear,
          currentPlan: newPriceData.currentPlan,
          recommendedPlan: newPriceData.recommendedPlan,
          planType: newPriceData.planType,
          price: newPriceData.price,
          discounts: newPriceData.pricing?.discounts || newPriceData.discounts,
          addons: {
            insightsAddOn: {
              ...newPriceData.addons.insightsAddOn,
              included: newPriceData.addons.insightsAddOn.included,
              visible: newPriceData.addons.insightsAddOn.visible,
              enabled: storedStates["renewal-form__addon--insights"] || false,
            },
            rewardsAddOn: {
              ...newPriceData.addons.rewardsAddOn,
              included: newPriceData.addons.rewardsAddOn.included,
              visible: newPriceData.addons.rewardsAddOn.visible,
              enabled: storedStates["renewal-form__addon--rewards"] || false,
            },
            rubricAddOn: {
              ...newPriceData.addons.rubricAddOn,
              included: newPriceData.addons.rubricAddOn.included,
              visible: newPriceData.addons.rubricAddOn.visible,
              enabled:
                storedStates["renewal-form__addon--unlimited-rubric"] || false,
            },
            slOnboardingAddOn: {
              ...newPriceData.addons.slOnboardingAddOn,
              included: newPriceData.addons.slOnboardingAddOn.included,
              visible: newPriceData.addons.slOnboardingAddOn.visible,
              enabled:
                storedStates["renewal-form__addon--admin-onboarding"] || false,
            },
            teacherTrainingAddOn: {
              ...newPriceData.addons.teacherTrainingAddOn,
              included: newPriceData.addons.teacherTrainingAddOn.included,
              visible: newPriceData.addons.teacherTrainingAddOn.visible,
              enabled:
                storedStates["renewal-form__addon--teacher-training"] || false,
            },
          },
          perUserPrices: {
            listPriceStarterPerUser:
              newPriceData.perUserPrices?.listPriceStarterPerUser ||
              newPriceData.pricing?.perUserPrices?.listPriceStarterPerUser,
            listPricePremiumPerUser:
              newPriceData.perUserPrices?.listPricePremiumPerUser ||
              newPriceData.pricing?.perUserPrices?.listPricePremiumPerUser,
            starterPerUser:
              newPriceData.perUserPrices?.starterPerUser ||
              newPriceData.pricing?.perUserPrices?.starterPerUser,
            premiumPerUser:
              newPriceData.perUserPrices?.premiumPerUser ||
              newPriceData.pricing?.perUserPrices?.premiumPerUser,
          },
        },
        users: pricingData.users,
      };

      // Show Savings tooltip based on priceBreakOpportunities value
      if (newPriceData.priceBreakOpportunities != null) {
        savingsTooltip.classList.add("active");
        modalOverlay.classList.add("active");
        savingsUsers.textContent =
          newPriceData.priceBreakOpportunities[0].nextTierUsers;
        savingsValue.textContent = formatPrice(
          newPriceData.priceBreakOpportunities[0].savings
        );
      } else {
        savingsTooltip?.classList.remove("active");
        modalOverlay.classList.remove("active");
      }

      console.log("New config data:", newConfigData);
      updateAddonStates(newConfigData);
      populateDynamicFields(newConfigData);
    } else {
      // For non-plan changes, use existing logic
      const pricingData = calculatePricingData(true);
      console.log("Pricing data being sent:", pricingData);
      const newPriceData = getPrice(pricingData);

      // Update configuration with current addon states
      const newConfigData = {
        pricing: {
          multiYear: pricingData.multiYear,
          currentPlan: newPriceData.currentPlan,
          recommendedPlan: newPriceData.recommendedPlan,
          planType: newPriceData.planType,
          price: newPriceData.price,
          discounts: newPriceData.pricing?.discounts || newPriceData.discounts,
          addons: {
            insightsAddOn: {
              ...newPriceData.addons.insightsAddOn,
              included: newPriceData.addons.insightsAddOn.included,
              visible: newPriceData.addons.insightsAddOn.visible,
              enabled: pricingData.insightsAddOn,
            },
            rewardsAddOn: {
              ...newPriceData.addons.rewardsAddOn,
              included: newPriceData.addons.rewardsAddOn.included,
              visible: newPriceData.addons.rewardsAddOn.visible,
              enabled: pricingData.rewardsAddOn,
            },
            rubricAddOn: {
              ...newPriceData.addons.rubricAddOn,
              included: newPriceData.addons.rubricAddOn.included,
              visible: newPriceData.addons.rubricAddOn.visible,
              enabled: pricingData.rubricAddOn,
            },
            slOnboardingAddOn: {
              ...newPriceData.addons.slOnboardingAddOn,
              included: newPriceData.addons.slOnboardingAddOn.included,
              visible: newPriceData.addons.slOnboardingAddOn.visible,
              enabled: pricingData.slOnboardingAddOn,
            },
            teacherTrainingAddOn: {
              ...newPriceData.addons.teacherTrainingAddOn,
              included: newPriceData.addons.teacherTrainingAddOn.included,
              visible: newPriceData.addons.teacherTrainingAddOn.visible,
              enabled: pricingData.teacherTrainingAddOn,
            },
          },
          perUserPrices: {
            listPriceStarterPerUser:
              newPriceData.perUserPrices?.listPriceStarterPerUser ||
              newPriceData.pricing?.perUserPrices?.listPriceStarterPerUser,
            listPricePremiumPerUser:
              newPriceData.perUserPrices?.listPricePremiumPerUser ||
              newPriceData.pricing?.perUserPrices?.listPricePremiumPerUser,
            starterPerUser:
              newPriceData.perUserPrices?.starterPerUser ||
              newPriceData.pricing?.perUserPrices?.starterPerUser,
            premiumPerUser:
              newPriceData.perUserPrices?.premiumPerUser ||
              newPriceData.pricing?.perUserPrices?.premiumPerUser,
          },
        },
        users: pricingData.users,
      };

      // Show Savings tooltip based on priceBreakOpportunities value
      if (newPriceData.priceBreakOpportunities != null) {
        savingsTooltip.classList.add("active");
        modalOverlay.classList.add("active");
        savingsUsers.textContent =
          newPriceData.priceBreakOpportunities[0].nextTierUsers;
        savingsValue.textContent = formatPrice(
          newPriceData.priceBreakOpportunities[0].savings
        );
      } else {
        savingsTooltip?.classList.remove("active");
        modalOverlay.classList.remove("active");
      }

      updateAddonStates(newConfigData);
      console.log("New config data:", newConfigData);
      populateDynamicFields(newConfigData);
    }
  }

  /*
/* ========== UPDATE ADDON STATES ON PLAN CHANGE ========== */

  function updateAddonStates(newConfigData) {
    const addons = {
      "renewal-form__addon--insights":
        newConfigData.pricing.addons.insightsAddOn,
      "renewal-form__addon--rewards": newConfigData.pricing.addons.rewardsAddOn,
      "renewal-form__addon--unlimited-rubric":
        newConfigData.pricing.addons.rubricAddOn,
      "renewal-form__addon--admin-onboarding":
        newConfigData.pricing.addons.slOnboardingAddOn,
      "renewal-form__addon--teacher-training":
        newConfigData.pricing.addons.teacherTrainingAddOn,
    };

    // Hide Software Addons if none of them are visible
    const softwareAddonsContainer = document.getElementById(
      "renewal-form__software-addons"
    );

    const softwareAddonIds = [
      "renewal-form__addon--insights",
      "renewal-form__addon--rewards",
      "renewal-form__addon--unlimited-rubric",
    ];

    const allSoftwareAddonIdsHidden = softwareAddonIds.every(
      (id) => !addons[id].visible
    );

    if (allSoftwareAddonIdsHidden) {
      if (allSoftwareAddonIdsHidden) {
        softwareAddonsContainer.classList.add("hidden");
      } else {
        softwareAddonsContainer.classList.remove("hidden");
      }
    }

    // Update both checkbox states and price labels
    Object.entries(addons).forEach(([id, addonData]) => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        const parentContainer = checkbox.parentElement;
        if (parentContainer) {
          // Update visibility
          parentContainer.parentElement.style.display = addonData.visible
            ? "block"
            : "none";
        }

        // Update checkbox state
        checkbox.checked = addonData.enabled;

        // Update price label
        const priceLabel = document.getElementById(`${id}--price`);
        if (priceLabel) {
          priceLabel.textContent = `+$${addonData.listPrice}`;
        }

        // Handle "included" addons
        const priceTag = parentContainer.querySelector(".addonprice");

        if (addonData.included) {
          parentContainer.classList.add("included");
          priceTag.textContent = `$${addonData.listPrice.toLocaleString()}`;
        } else {
          parentContainer.classList.remove("included");
          priceTag.textContent = `$${addonData.listPrice.toLocaleString()}`;
        }

        if (
          addonData.included &&
          (addonData.listPrice !== undefined || addonData.listPrice !== null)
        ) {
          parentContainer
            .querySelector(".addon__checkbox-icon")
            .classList.add("visible");
          checkbox.checked = addonData.included;
          parentContainer.style.pointerEvents = "none";
        } else {
          parentContainer
            .querySelector(".addon__checkbox-icon")
            .classList.remove("visible");
          parentContainer.style.pointerEvents = "unset";
        }

        // Handle "enabled" addons
        if (addonData.enabled) {
          const parentElements = [
            "addon__title",
            "addon__description",
            "addonprice",
            "addon__checkbox-custom",
            "addon__checkbox-icon",
          ];

          parentElements.forEach((className) => {
            const element = parentContainer.querySelector(`.${className}`);
            if (element) {
              element.classList.add("checked");
            }
          });

          parentContainer.classList.add("checked");
          parentContainer
            .querySelector(".addon__checkbox-icon")
            .classList.add("checked");
        } else {
          parentContainer.classList.remove("checked");
          parentContainer
            .querySelector(".addon__checkbox-icon")
            .classList.remove("checked");
        }
      }
    });
  }

  /*
/* ========== LISTEN FOR FIELDS CHANGES ========== */

  function updateRubricPrice() {
    const users = document.getElementById("renewal-form__users");
    const subscriptionTerm = document.getElementById(
      "renewal-form__subscription-term"
    );
    const userCount = parseInt(users.value) || 0;
    const multiYear = subscriptionTerm ? parseInt(subscriptionTerm.value) : 1;

    // Add logging
    console.log("Current values:", {
      userCount,
      multiYear,
      currentPlan: planSwitcher.currentPlan,
    });

    // Get the appropriate tier based on user count
    let tier;
    for (var p = 0; p < config.prices.length; p++) {
      if (userCount >= config.prices[p].staffCount) {
        tier = config.prices[p];
      }
    }

    if (tier) {
      const basePrice = Math.ceil(userCount * tier.rubricAddOn);
      const multiYearDiscount = config.multiYearDiscounts[multiYear] || 0;
      const discountedPrice = basePrice * (1 - multiYearDiscount);
      // Multiply by number of years to get total price
      const totalPrice = discountedPrice * multiYear;

      const priceElement = document.getElementById(
        "renewal-form__addon--unlimited-rubric--price"
      );
      if (priceElement) {
        priceElement.textContent = formatPrice(totalPrice);
      }
    }
  }

  function setupPricingListeners() {
    // Listen for multiYear dropdown changes
    const subscriptionTerm = document.getElementById(
      "renewal-form__subscription-term"
    );
    if (subscriptionTerm) {
      subscriptionTerm.addEventListener("change", () => {
        updatePricing();
        updateRubricPrice();
      });
    }

    // Listen for users input changes
    const users = document.getElementById("renewal-form__users");
    if (users) {
      users.addEventListener("input", () => {
        updatePricing();
        updateRubricPrice();
      });
    }

    // Listen for checkbox changes
    const addonIds = [
      "renewal-form__addon--insights",
      "renewal-form__addon--rewards",
      "renewal-form__addon--unlimited-rubric",
      "renewal-form__addon--admin-onboarding",
      "renewal-form__addon--teacher-training",
    ];

    addonIds.forEach((id) => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        const checkboxParent = checkbox.parentElement;
        const checkboxElements = [
          "addon__title",
          "addon__description",
          "addonprice",
          "addon__checkbox-custom",
          "addon__checkbox-icon",
        ];

        // Remove the shared isChecked variable and use the checkbox's checked property
        checkbox.addEventListener("change", () => {
          const isChecked = checkbox.checked;

          if (isChecked) {
            checkboxParent.classList.add("checked");
            checkboxElements.forEach((className) => {
              const element = checkboxParent.querySelector(`.${className}`);
              if (element) {
                element.classList.add("checked");
              }
            });
          } else {
            checkboxParent.classList.remove("checked");
            checkboxElements.forEach((className) => {
              const element = checkboxParent.querySelector(`.${className}`);
              if (element) {
                element.classList.remove("checked");
              }
            });
          }

          updatePricing();

          if (id === "renewal-form__addon--unlimited-rubric") {
            updateRubricPrice();
          }
        });
      }
    });

    // Listen for plan changing
    const plansTriggers = ["edit-plan__premium", "edit-plan__starter"];

    plansTriggers.forEach((id) => {
      const trigger = document.getElementById(id);
      if (trigger) {
        trigger.addEventListener("click", (event) => {
          const planType = id.replace("edit-plan__", "");
          planSwitcher.switchPlan(planType);
          updatePricing(event);
        });
      }
    });

    // Add listener for plan select changes
    const planSelect = document.getElementById("renewal-form__selected-plan");
    if (planSelect) {
      planSelect.addEventListener("change", (event) => {
        planSwitcher.switchPlan(event.target.value);
        updatePricing(event);
      });
    }
  }

  // Define plan types as constants to avoid string literals
  const PLAN_TYPES = {
    PREMIUM: "premium",
    STARTER: "starter",
  };

  // Plan configuration object
  const PLAN_CONFIG = {
    [PLAN_TYPES.PREMIUM]: {
      displayName: "Premium plan",
      description:
        "All features, unlimited behaviors, all Insights reports, and Premium support.",
      tag: "premium",
    },
    [PLAN_TYPES.STARTER]: {
      displayName: "Starter plan",
      description:
        "All features, up to 10 behaviors, basic Insights reports, and basic support.",
      tag: "starter",
    },
  };

  class PlanSwitcher {
    constructor() {
      this.currentPlan = null;
      this.elements = {
        modal: document.getElementById("edit-plan__modal"),
        planSwitcher: document.getElementById("renewal-form__plan-switcher"),
        currentPlanLabel: document.getElementById("renewal-form__current-plan"),
        planDisplayText: document.getElementById(
          "renewal-form__current-plan--text"
        ),
        planDescription: document.getElementById(
          "renewal-form__current-plan--label"
        ),
        stepHeadingPlan: document.getElementById(
          "renewal-form__step-heading__plan"
        ),
        starterTag: document
          .getElementById("edit-plan__starter-container")
          .querySelector(".plan__tag"),
        premiumTag: document
          .getElementById("edit-plan__premium-container")
          .querySelector(".plan__tag"),
      };

      this.addonStates = {
        starter: {},
        premium: {},
      };

      this.initializeEventListeners();
    }

    // Save addon states that were initially populated by config
    saveCurrentAddonStates() {
      if (!this.currentPlan) return;

      const addons = [
        "renewal-form__addon--insights",
        "renewal-form__addon--rewards",
        "renewal-form__addon--unlimited-rubric",
        "renewal-form__addon--admin-onboarding",
        "renewal-form__addon--teacher-training",
      ];

      // New object with initial addon states
      const currentStates = addons.reduce((states, id) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
          states[id] = checkbox.checked;
        }
        return states;
      }, {});

      // Store a copy of the addon states for the current plan
      this.addonStates[this.currentPlan] = { ...currentStates };
    }

    initializeEventListeners() {
      // Plan switching triggers
      document
        .getElementById("renewal-form__edit-plan")
        .addEventListener("click", () => this.showPlanModal());

      document
        .getElementById("edit-plan__close")
        .addEventListener("click", () => this.hidePlanModal());

      // Plan selection handlers
      document
        .getElementById("edit-plan__starter")
        .addEventListener("click", () => this.switchPlan(PLAN_TYPES.STARTER));

      document
        .getElementById("edit-plan__premium")
        .addEventListener("click", () => this.switchPlan(PLAN_TYPES.PREMIUM));
    }

    showPlanModal() {
      this.elements.modal.classList.add("visible");
      this.updatePlanUI();
    }

    hidePlanModal() {
      this.elements.modal.classList.remove("visible");
    }

    switchPlan(planType) {
      console.log("switchPlan called with:", planType);
      if (!PLAN_CONFIG[planType]) {
        return;
      }

      // Save current addon states before making the plan switch
      if (this.currentPlan) {
        this.saveCurrentAddonStates();
      }

      this.currentPlan = planType;
      config.selectedPlan = planType;

      this.updatePlanUI();
      this.hidePlanModal();
      this.handlePlanDiscounts();

      // Use the stored addon states for the plan we're switching to
      const storedStates = this.addonStates[planType] || {};
      this.restoreAddonStates(storedStates);

      // Trigger price recalculation
      this.triggerPriceUpdate(planType);
    }

    // Handle discount values tied to specific plans configuration
    handlePlanDiscounts() {
      // Store the original discounts when first initialized
      if (this._originalLegacyDiscount === undefined) {
        this._originalLegacyDiscount = config.legacyDiscount;
      }

      // Get discount fields
      const legacyDiscountField = document.getElementById(
        "renewal-form__legacy-discount"
      );

      if (
        (config.currentPlan === "premiumPlus" ||
          config.currentPlan === "premium") &&
        (originalRecommendedPlan === "premium" ||
          config.recommendedPlan === "starter") &&
        this.currentPlan === "starter"
      ) {
        // Switching to starter, if all conditions met - remove legacy discount
        config.legacyDiscount = 0;

        // Output the value to hidden form field
        legacyDiscountField.value = 0;
      } else if (this.currentPlan === "premium") {
        // Switching back to premium - restore original legacy discount
        config.legacyDiscount = this._originalLegacyDiscount;

        // Output the value to hidden form field
        legacyDiscountField.value = this._originalLegacyDiscount;
      }
    }

    updatePlanUI() {
      const planConfig = PLAN_CONFIG[this.currentPlan];

      if (!planConfig) return;

      // Update all plan-related UI elements
      this.elements.currentPlanLabel.textContent = this.currentPlan;
      this.elements.planDisplayText.textContent = planConfig.displayName;
      this.elements.planDescription.textContent = planConfig.description;
      this.elements.stepHeadingPlan.textContent = planConfig.displayName;

      // Add explicit plan select update with logging
      const planSelect = document.getElementById("renewal-form__selected-plan");
      if (planSelect) {
        planSelect.value = this.currentPlan;
      }

      // Update plan tags
      this.elements.starterTag.classList.toggle(
        "visible",
        this.currentPlan === PLAN_TYPES.STARTER
      );
      this.elements.premiumTag.classList.toggle(
        "visible",
        this.currentPlan === PLAN_TYPES.PREMIUM
      );

      // If recommendationMsg is present, update display of recommendationMsg container based on selected plan
      if (hasRecommendedMsg) {
        if (this.currentPlan === PLAN_TYPES.STARTER) {
          recommendedPlanMessage.classList.remove("unset");
        } else if (this.currentPlan === PLAN_TYPES.PREMIUM) {
          recommendedPlanMessage.classList.add("unset");
        }
      }
    }

    triggerPriceUpdate(planType) {
      // Create and dispatch a custom event for price recalculation
      const planChangeEvent = new CustomEvent("planChange", {
        detail: { planType },
      });
      document.dispatchEvent(planChangeEvent);
    }

    // Initialize the plan switcher with a default plan
    initialize(defaultPlan = PLAN_TYPES.STARTER) {
      this.currentPlan = defaultPlan;
      this.updatePlanUI();
    }

    // Restore inital addon states that were populated by config
    restoreAddonStates(states) {
      Object.entries(states).forEach(([id, wasChecked]) => {
        const checkbox = document.getElementById(id);

        if (checkbox) {
          const parentContainer = checkbox.parentElement;
          checkbox.checked = wasChecked;

          // Update UI classes based on checked state
          if (wasChecked) {
            parentContainer.classList.add("checked");
            const elements = [
              "addon__title",
              "addon__description",
              "addonprice",
              "addon__checkbox-custom",
              "addon__checkbox-icon",
            ];
            elements.forEach((className) => {
              const element = parentContainer.querySelector(`.${className}`);
              if (element) {
                element.classList.add("checked");
              }
            });
          } else {
            parentContainer.classList.remove("checked");
            const elements = [
              "addon__title",
              "addon__description",
              "addonprice",
              "addon__checkbox-custom",
              "addon__checkbox-icon",
            ];
            elements.forEach((className) => {
              const element = parentContainer.querySelector(`.${className}`);
              if (element) {
                element.classList.remove("checked");
              }
            });
          }
        }
      });
    }
  }

  const planSwitcher = new PlanSwitcher();

  document.addEventListener("planChange", (event) => {
    const { planType } = event.detail;

    // Store current values
    const subscriptionTerm = document.getElementById(
      "renewal-form__subscription-term"
    );
    const multiYear = subscriptionTerm ? parseInt(subscriptionTerm.value) : 1;
    const users = document.getElementById("renewal-form__users");
    const userCount = parseInt(users.value) || 0;

    // Do the regular price update
    updatePricing({
      target: {
        id: `edit-plan__${planType}`,
        value: planType,
      },
    });

    // Wait for next tick to ensure all other updates are done
    requestAnimationFrame(() => {
      const priceElement = document.getElementById(
        "renewal-form__addon--unlimited-rubric--price"
      );
      if (priceElement) {
        let tier;
        for (var p = 0; p < config.prices.length; p++) {
          if (userCount >= config.prices[p].staffCount) {
            tier = config.prices[p];
          }
        }

        if (tier) {
          const basePrice = Math.ceil(userCount * tier.rubricAddOn);
          const multiYearDiscount = config.multiYearDiscounts[multiYear] || 0;
          const discountedPrice = basePrice * (1 - multiYearDiscount);
          const totalPrice = discountedPrice * multiYear;

          priceElement.textContent = formatPrice(totalPrice);
        }
      }
    });
  });

  // Initialize the form price calculation system
  function setupPricingSystem() {
    // Wait for any async operations to complete
    setTimeout(() => {
      // Get initial plan from the form or configuration
      const initialPlan = document
        .getElementById("renewal-form__current-plan")
        .textContent.toLowerCase();

      // Initialize plan switcher
      planSwitcher.initialize(initialPlan);

      // Trigger initial price calculation with the current state
      const pricingData = calculatePricingData(true); // Include current addon states
      const newPriceData = getPrice(pricingData);

      // Update config with initial state
      const initialConfig = {
        pricing: {
          multiYear: pricingData.multiYear,
          currentPlan: newPriceData.currentPlan,
          recommendedPlan: newPriceData.recommendedPlan,
          planType: newPriceData.planType,
          price: newPriceData.price,
          addons: {
            insightsAddOn: {
              ...newPriceData.addons.insightsAddOn,
              enabled: pricingData.insightsAddOn,
            },
            rewardsAddOn: {
              ...newPriceData.addons.rewardsAddOn,
              enabled: pricingData.rewardsAddOn,
            },
            rubricAddOn: {
              ...newPriceData.addons.rubricAddOn,
              enabled: pricingData.rubricAddOn,
            },
            slOnboardingAddOn: {
              ...newPriceData.addons.slOnboardingAddOn,
              enabled: pricingData.slOnboardingAddOn,
            },
            teacherTrainingAddOn: {
              ...newPriceData.addons.teacherTrainingAddOn,
              enabled: pricingData.teacherTrainingAddOn,
            },
          },
        },
        users: pricingData.users,
      };

      requestAnimationFrame(() => {
        try {
          const subscriptionTerm = document.getElementById(
            "renewal-form__subscription-term"
          );
          const users = document.getElementById("renewal-form__users");
          if (!subscriptionTerm || !users) return;

          const multiYear = subscriptionTerm
            ? parseInt(subscriptionTerm.value)
            : 1;
          const userCount = parseInt(users.value) || 0;

          const priceElement = document.getElementById(
            "renewal-form__addon--unlimited-rubric--price"
          );
          if (!priceElement) return;

          let tier;
          for (var p = 0; p < config.prices.length; p++) {
            if (userCount >= config.prices[p].staffCount) {
              tier = config.prices[p];
            }
          }

          if (tier) {
            const basePrice = Math.ceil(userCount * tier.rubricAddOn);
            const multiYearDiscount = config.multiYearDiscounts[multiYear] || 0;
            const discountedPrice = basePrice * (1 - multiYearDiscount);
            const totalPrice = discountedPrice * multiYear;

            priceElement.textContent = formatPrice(totalPrice);
          }
        } catch (err) {
          console.error("Error setting initial rubric price:", err);
        }
      });

      // Add listener for plan select changes
      const planSelect = document.getElementById("renewal-form__selected-plan");
      if (planSelect) {
        planSelect.addEventListener("change", (event) => {
          planSwitcher.switchPlan(event.target.value);
          updatePricing(event);
        });
      }

      // Update UI with initial state
      updateAddonStates(initialConfig);
      populateDynamicFields(initialConfig);

      // Set up pricing listeners after initial state is set
      setupPricingListeners();
    }, 0);
  }

  // Initialize initial script
  function initializeScript() {
    // Check for URL params
    const params = new URLSearchParams(window.location.search);
    if (!params.has("companyId") && !params.has("schoolName")) {
      document.getElementById("renewal-calc__no-data").classList.add("visible");
    } else {
      console.log("External pricing script loaded!");
      const configData = getConfig();
      setupPricingSystem();
      console.log("Config received:", configData);
      populateFields(configData);
    }

    // Remove UI loading state
    document.getElementById("renewal-calc__loading-modal").style.display =
      "none";
    document
      .getElementById("renewal-calc__quote-bar")
      .classList.remove("onload-state");
    document
      .getElementById("renewal-calc__quote-main")
      .classList.remove("onload-state");
  }

  initializeScript();

  /*
  /* ========== TIME OF INVOICING FUNCTIONALITY ========== */
  const purchaseOrderContainer = document.getElementById(
    "renewal-form__purchase-order"
  );
  const purchaseOrder = document.getElementById(
    "renewal-form__purchase-order-nr"
  );
  const timeOfInvoicing = document.getElementById(
    "renewal-form__invoice-option"
  );

  if (timeOfInvoicing.value === "Later") {
    purchaseOrderContainer.style.display = "none";
    invoiceDateContainer.style.display = "flex";
  } else if (timeOfInvoicing.value === "Now") {
    purchaseOrderContainer.style.display = "flex";
    invoiceDateContainer.style.display = "none";
  }

  timeOfInvoicing.addEventListener("change", (event) => {
    const selectedValue = event.target.value;

    if (selectedValue === "Later") {
      purchaseOrderContainer.style.display = "none";
      invoiceDateContainer.style.display = "flex";
    } else if (selectedValue === "Now") {
      purchaseOrderContainer.style.display = "flex";
      invoiceDateContainer.style.display = "none";
    }
  });

  /*
/* ========== MULTI STEP FORM FUNCTIONALITY ========== */
  function displayFormStepOne() {
    formStepOne.style.display = "flex";
    formStepTwo.style.display = "none";
    goToStepTwo.style.display = "flex";
    stepOneTab.classList.add("active");
    stepOneTabText.classList.add("active");
    stepTwoTab.classList.remove("active");
    stepTwoTabText.classList.remove("active");
    submitFormButton.classList.remove("active");
    planSwitchBlock.classList.remove("hidden");
    recommendedPlanMessage.classList.remove("hidden");
    document.getElementById("submit-form-button--checker").style.display =
      "none";
    emailForm.style.display = "flex";
    goToStepOne.style.display = "none";

    if (
      emailFormSuccessMsg.style.display === "block" ||
      getComputedStyle(emailFormSuccessMsg).display === "block"
    ) {
      emailForm.style.display = "none";
    }

    if (window.innerWidth < 992) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function displayFormStepTwo() {
    formStepOne.style.display = "none";
    formStepTwo.style.display = "flex";
    goToStepTwo.style.display = "none";
    stepOneTab.classList.remove("active");
    stepOneTabText.classList.remove("active");
    stepTwoTab.classList.add("active");
    stepTwoTabText.classList.add("active");
    submitFormButton.classList.add("active");
    planSwitchBlock.classList.add("hidden");
    recommendedPlanMessage.classList.add("hidden");
    document.getElementById("submit-form-button--checker").style.display =
      "block";
    emailForm.style.display = "none";
    goToStepOne.style.display = "block";

    if (
      emailFormSuccessMsg.style.display === "block" ||
      getComputedStyle(emailFormSuccessMsg).display === "block"
    ) {
      emailForm.style.display = "none";
      emailFormSuccessMsg.style.display = "none";
    }

    if (window.innerWidth < 992) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  stepOneTab.addEventListener("click", () => {
    displayFormStepOne();
  });

  stepTwoTab.addEventListener("click", (e) => {
    const currentPlan = planSwitcher.currentPlan;
    const isRewardsChecked = rewardsCheckbox ? rewardsCheckbox.checked : false;

    // Show Upsell modal if on starter plan and rewards addon not selected
    if (currentPlan === "starter" && !isRewardsChecked) {
      e.preventDefault();
      e.stopPropagation();
      showUpsellModal();
    } else {
      displayFormStepTwo();
    }
  });

  goToStepOne.addEventListener("click", () => {
    displayFormStepOne();
  });

  goToStepTwo.addEventListener("click", function (e) {
    const currentPlan = planSwitcher.currentPlan;
    const isRewardsChecked = rewardsCheckbox ? rewardsCheckbox.checked : false;

    // Show Upsell modal if on starter plan and rewards addon not selected
    if (currentPlan === "starter" && !isRewardsChecked) {
      e.preventDefault();
      e.stopPropagation();
      showUpsellModal();
    } else {
      displayFormStepTwo();
    }
  });

  /*
/* ========== UI INTERACTIONS ========== */
  function initializeUIInteractions(configData) {
    // Show Savings tooltip based on priceBreakOpportunities value

    increaseBtn.addEventListener("click", () => {
      const currentConfig = {
        users: parseInt(usersField.value),
        planType: planSwitcher.currentPlan,
        districtDiscount: configData.pricing.discounts.districtDiscount,
        legacyDiscount: configData.pricing.discounts.legacyDiscount,
        multiYear: configData.pricing.multiYear,
        insightsAddOn: configData.pricing.addons.insightsAddOn.enabled,
        rewardsAddOn: configData.pricing.addons.rewardsAddOn.enabled,
        rubricAddOn: configData.pricing.addons.rubricAddOn.enabled,
        slOnboardingAddOn: configData.pricing.addons.slOnboardingAddOn.enabled,
        teacherTrainingAddOn:
          configData.pricing.addons.teacherTrainingAddOn.enabled,
      };

      const currentPriceData = getPrice(currentConfig);

      if (currentPriceData.priceBreakOpportunities) {
        usersField.value =
          currentPriceData.priceBreakOpportunities[0].nextTierUsers;
        usersField.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    // Close button for Savings tooltip
    const closeSavingsTooltip = document.getElementById(
      "actions__savings-close"
    );
    closeSavingsTooltip.addEventListener("click", () => {
      savingsTooltip.classList.remove("active");
      modalOverlay.classList.remove("active");
    });

    // Email tooltip message functionality
    const emailTrigger = document.getElementById("renewal-form__email-trigger");
    const emailTriggerTooltip = document.getElementById(
      "renewal-form__email-tooltip"
    );

    emailTrigger.addEventListener("mouseover", () => {
      emailTriggerTooltip.classList.add("active");
    });

    emailTrigger.addEventListener("mouseleave", () => {
      emailTriggerTooltip.classList.remove("active");
    });

    // Submit form button positioning
    const formSubmit = document.getElementById("submit-form-button");
    const formSubmitChecker = document.getElementById(
      "submit-form-button--checker"
    );
    function adjustButtonPosition() {
      const viewportWidth = window.innerWidth;
      if (viewportWidth > 1280) {
        const rightOffset = (viewportWidth - 1200) / 2;
        formSubmit.style.right = `${rightOffset}px`;
        formSubmitChecker.style.right = `${rightOffset}px`;
      }
    }

    adjustButtonPosition();
    window.addEventListener("resize", adjustButtonPosition);
  }

  if (document.readyState === "loading") {
    addEventListener("DOMContentLoaded", () => {
      const configData = getConfig();
      initializeUIInteractions(configData);
    });
  } else {
    const configData = getConfig();
    initializeUIInteractions(configData);
  }

  /*
/* ========== FORM VALIDATION WITH ERROR MESSAGES ========== */
  class ButtonStateManager {
    constructor(buttonId, overlayId) {
      this.button = document.getElementById(buttonId);
      this.overlay = document.getElementById(overlayId);
      this.isDisabled = true;
      this.updateOverlayState();
    }

    setEnabled(enabled) {
      this.isDisabled = !enabled;
      this.updateOverlayState();
    }

    updateOverlayState() {
      if (!this.overlay || !this.button) return;

      if (this.isDisabled) {
        this.overlay.classList.add("active-overlay");
        this.button.setAttribute("aria-disabled", "true");
        this.overlay.setAttribute("data-blocked", "true");
        this.overlay.style.cursor = "default";
      } else {
        this.overlay.classList.remove("active-overlay");
        this.button.setAttribute("aria-disabled", "false");
        this.overlay.setAttribute("data-blocked", "false");
        this.overlay.style.cursor = "pointer";
      }
    }
  }

  function validateForm(isEmailForm = false) {
    let baseRequiredFields = [];

    if (isEmailForm) {
      baseRequiredFields = [
        { id: "renewal-form__users", label: "How many Staff Users?" },
      ];
    } else {
      baseRequiredFields = [
        { id: "renewal-form__users", label: "How many Staff Users?" },
        { id: "renewal-form__subscription-term", label: "Purchase Order" },
        {
          id: "renewal-form__name-firstname",
          label: "Your Name - First Name",
        },
        {
          id: "renewal-form__name-lastname",
          label: "Your Name - Last Name",
        },
        {
          id: "renewal-form__contact-firstname",
          label: "Invoice Contact - First Name",
        },
        {
          id: "renewal-form__contact-lastname",
          label: "Invoice Contact - Last Name",
        },
        { id: "renewal-form__contact-email", label: "Invoice Contact - Email" },
        {
          id: "renewal-form__billing-email",
          label: "Bill To Email",
        },
      ];
    }

    const invoiceOption = document.getElementById(
      "renewal-form__invoice-option"
    )?.value;
    let requiredFields = [...baseRequiredFields];

    if (invoiceOption === "Later") {
      requiredFields.push(
        { id: "renewal-form__invoice-month", label: "Invoice month" },
        { id: "renewal-form__invoice-day", label: "Invoice day" },
        { id: "renewal-form__invoice-year", label: "Invoice year" }
      );
    }

    const errors = requiredFields
      .filter((field) => {
        const element = document.getElementById(field.id);
        return !element || !element.value.trim();
      })
      .map((field) => field.label);

    // Email validations
    const billingEmail = document.getElementById("renewal-form__billing-email");
    if (
      billingEmail &&
      billingEmail.value.trim() &&
      !validateEmail(billingEmail.value.trim())
    ) {
      errors.push("Bill To Email");
    }

    const billingEmailsInput = document.getElementById(
      "renewal-form__billing-emails"
    );
    if (
      billingEmailsInput &&
      billingEmailsInput.value.trim() &&
      !validateBillingEmails(billingEmailsInput.value)
    ) {
      errors.push("Other Invoice Emails");
    }

    const invoiceContactEmail = document.getElementById(
      "renewal-form__contact-email"
    );
    if (
      invoiceContactEmail &&
      invoiceContactEmail.value.trim() &&
      !validateBillingEmails(invoiceContactEmail.value)
    ) {
      errors.push("Invoice Contact - Email");
    }

    return errors;
  }

  function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Validation of "Other Invoice Emails field"
  function validateBillingEmails(value) {
    // Field is optional, so empty value should pass
    if (!value || value.trim() === "") {
      return true;
    }

    // Split by comma and trim each email
    const emails = value.split(",").map((email) => email.trim());

    // Check if there's more than 3 emails
    if (emails.length > 3) {
      return false;
    }

    // Validate each email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Check for empty items between commas (e.g., "email@test.com,,email2@test.com")
    if (emails.some((email) => email === "")) {
      return false;
    }

    // Validate format of each email
    return emails.every((email) => emailRegex.test(email));
  }

  function showTooltip(errors, tooltipElement, buttonManager) {
    if (!tooltipElement) return;

    const tooltipList = tooltipElement.querySelector(".tooltip-errors__list");
    if (!tooltipList) return;

    tooltipList.innerHTML = "";
    const errorElements = document.querySelectorAll(
      ".email-form__tooltip-text--error-sm"
    );

    if (errors.length > 0) {
      buttonManager.setEnabled(false);
      errors.forEach((error) => {
        const listItem = document.createElement("li");
        listItem.textContent = error;
        listItem.classList.add("tooltip-errors__list-item");
        tooltipList.appendChild(listItem);

        if (error.includes("Email")) {
          errorElements.forEach((element) => {
            element.style.display = "block";
          });
        } else {
          errorElements.forEach((element) => {
            element.style.display = "none";
          });
        }
      });
      tooltipElement.classList.add("active");
    } else {
      buttonManager.setEnabled(true);
      tooltipElement.classList.remove("active");
      errorElements.forEach((element) => {
        element.style.display = "none";
      });
    }
  }

  // Handle hover functionality that shows tooltips
  function handleHover(buttonId, tooltipId, overlayId, infoTooltipId = null) {
    const tooltip = document.getElementById(tooltipId);
    const buttonManager = new ButtonStateManager(buttonId, overlayId);
    const infoTooltip = infoTooltipId
      ? document.getElementById(infoTooltipId)
      : null;
    const isEmailForm = tooltipId === "validation-errors--email";

    if (!tooltip) return;

    const showTooltipHandler = () => {
      const errors = validateForm(isEmailForm);
      showTooltip(errors, tooltip, buttonManager);

      // Show info tooltip only if there are no errors and it exists
      // and we're on desktop
      if (infoTooltip && errors.length === 0 && window.innerWidth >= 992) {
        infoTooltip.classList.add("active");
      }

      // Handle mobile overlay visibility
      if (window.innerWidth < 992) {
        if (errors.length > 0) {
          buttonManager.overlay.style.display = "block";
        } else {
          buttonManager.overlay.style.display = "none";
        }
      } else {
        buttonManager.overlay.style.display = "block";
      }
    };

    const hideTooltipHandler = () => {
      tooltip.classList.remove("active");
      if (infoTooltip && window.innerWidth >= 992) {
        infoTooltip.classList.remove("active");
      }
    };

    // Add click handler to the overlay
    buttonManager.overlay.addEventListener("click", (e) => {
      if (buttonManager.overlay.getAttribute("data-blocked") === "false") {
        buttonManager.button.click();
      }
    });

    // Add close button handlers for mobile
    const closeButtonId =
      tooltipId === "validation-errors--email"
        ? "tooltip-error__close--email"
        : "tooltip-error__close";

    const closeButton = document.getElementById(closeButtonId);
    if (closeButton) {
      closeButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event from bubbling to overlay
        hideTooltipHandler();
      });
    }

    // Different behavior for mobile and desktop
    if (window.innerWidth < 992) {
      // Mobile: Show error tooltip on click only
      buttonManager.overlay.addEventListener("click", showTooltipHandler);

      // Hide tooltip when clicking outside
      document.addEventListener("click", (e) => {
        if (!buttonManager.overlay.contains(e.target)) {
          hideTooltipHandler();
        }
      });

      // Initial check for errors on mobile
      const initialErrors = validateForm();
      if (initialErrors.length === 0) {
        buttonManager.overlay.style.display = "none";
      }
    } else {
      // Desktop: Show both tooltips on hover
      buttonManager.overlay.addEventListener("mouseenter", showTooltipHandler);
      buttonManager.overlay.addEventListener("mouseleave", hideTooltipHandler);
    }

    // Form monitoring
    const form = document.querySelector("form");
    form.addEventListener("input", () => {
      const errors = validateForm();
      buttonManager.setEnabled(errors.length === 0);

      // Handle mobile overlay visibility on form changes
      if (window.innerWidth < 992) {
        if (errors.length > 0) {
          buttonManager.overlay.style.display = "block";
        } else {
          buttonManager.overlay.style.display = "none";
        }
      }

      // Hide info tooltip if there are errors and we're on desktop
      if (infoTooltip && errors.length > 0 && window.innerWidth >= 992) {
        infoTooltip.classList.remove("active");
      }
    });

    // Handle resize events
    window.addEventListener("resize", () => {
      const isMobile = window.innerWidth < 992;
      hideTooltipHandler();

      // Re-initialize event listeners based on new screen size
      buttonManager.overlay.removeEventListener(
        "mouseenter",
        showTooltipHandler
      );
      buttonManager.overlay.removeEventListener(
        "mouseleave",
        hideTooltipHandler
      );
      buttonManager.overlay.removeEventListener("click", showTooltipHandler);

      // Check for errors and set overlay visibility
      const errors = validateForm();
      if (isMobile) {
        buttonManager.overlay.style.display =
          errors.length > 0 ? "block" : "none";
        buttonManager.overlay.addEventListener("click", showTooltipHandler);
      } else {
        buttonManager.overlay.style.display = "block";
        buttonManager.overlay.addEventListener(
          "mouseenter",
          showTooltipHandler
        );
        buttonManager.overlay.addEventListener(
          "mouseleave",
          hideTooltipHandler
        );
      }
    });
  }

  function initializeHoverHandlers() {
    // Initialize email trigger with both tooltips
    handleHover(
      "renewal-form__email-trigger",
      "validation-errors--email",
      "renewal-form__email-trigger--checker",
      "renewal-form__email-tooltip"
    );

    // Initialize submit button (unchanged)
    handleHover(
      "submit-form-button",
      "validation-errors",
      "submit-form-button--checker"
    );
  }

  function initializeFormSubmission() {
    const form = document.querySelector("form");
    const submitButton = document.getElementById("submit-form-button");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const errors = validateForm();
      if (errors.length === 0) {
        submitButton.click();
      } else {
        const tooltip = document.getElementById("validation-errors");
        const buttonManager = new ButtonStateManager(
          "submit-form-button",
          "submit-form-button--checker"
        );
        showTooltip(errors, tooltip, buttonManager);
      }
    });

    // Prevent Enter key separately
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        return false;
      }
    });
  }

  // Initialize and Form validation
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initializeHoverHandlers();
      initializeFormSubmission();
    });
  } else {
    initializeHoverHandlers();
    initializeFormSubmission();
  }

  // Form success handling
  const successMessage = document.querySelector(".success-message-4");
  if (successMessage) {
    // Set up a MutationObserver to watch for style changes
    const observer = new MutationObserver(function () {
      const displayStyle = window.getComputedStyle(successMessage).display;
      if (displayStyle === "block") {
        document.getElementById("renewal-calc__quote-bar").style.display =
          "none";
        document
          .querySelector(".renewal-calculator__menu")
          .classList.add("complete");
        document
          .querySelectorAll(".renewal-calc__menu-link")
          .forEach((link) => {
            link.style.pointerEvents = "none";
          });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    // Configure the observer to watch for attribute changes
    observer.observe(successMessage, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }
}

/*
/* ========== CANCELLATION CALCULATOR LOGIC ========== */
function runCancellationLogic() {
  // Initialize initial script
  function initializeScript() {
    // Check for URL params
    const params = new URLSearchParams(window.location.search);
    if (!params.has("companyId") && !params.has("schoolName")) {
      document.getElementById("renewal-calc__no-data").classList.add("visible");

      // Remove UI loading state
      document.getElementById("renewal-calc__loading-modal").style.display =
        "none";
      document
        .getElementById("renewal-calc__quote-bar")
        .classList.remove("onload-state");
      document
        .getElementById("renewal-calc__quote-main")
        .classList.remove("onload-state");
    } else {
      initializeForm();
    }
  }

  initializeScript();

  function initializeForm() {
    /* --- Cancellation form --- */

    // Get initial configuration just for user count
    const configData = getConfig();
    const showOffer = configData.showOffer;

    // Populate Renewal Deal ID
    const renewalDealID = configData.renewalDealId;
    const renewalDealField = document.getElementById("cancel-form__renewal-id");
    renewalDealField.value = renewalDealID;

    // Populate "Experience" field based on where the Renewal calculator was loaded (web or in-app)
    document
      .querySelectorAll(".cancellation-form__experience")
      .forEach((renewalExperience) => {
        try {
          if (window.self !== window.top) {
            renewalExperience.value = "in-app";
          } else {
            renewalExperience.value = "web";
          }
        } catch (e) {
          renewalExperience.value = "in-app";
        }
      });

    // Hide "Canceller Name" field if calculator is loaded in-app
    const cancellerName = document.getElementById(
      "cancellation-form__canceller-name-wrapper"
    );

    if (window.self !== window.top) {
      cancellerName.style.display = "none";
    }

    // Global constants
    const cancelSection = document.getElementById("calc-cancel__container");
    const exitSurveySection = document.getElementById("calc-exit__container");
    const cancelSectionTrigger = document.getElementById("exit-form__back-btn");

    if (showOffer === false) {
      initExitSurvey();

      cancelSection.style.display = "none";
      exitSurveySection.style.display = "flex";
      cancelSectionTrigger.style.display = "none";

      // Remove loading states
      document.getElementById("renewal-calc__loading-modal").style.display =
        "none";
      document
        .getElementById("calc-cancel__container")
        .classList.remove("onload-state");
    } else {
      initExitSurvey();

      // Remove loading states
      document.getElementById("renewal-calc__loading-modal").style.display =
        "none";
      document
        .getElementById("calc-cancel__container")
        .classList.remove("onload-state");
    }

    function initExitSurvey() {
      // Populate initial user count
      const usersField = document.getElementById("renewal-form__users");
      if (usersField && configData.users) {
        usersField.value = configData.users;
      }

      // Always set starter plan, regardless of what's in the config
      const planField = document.getElementById("renewal-form__selected-plan");
      if (planField) {
        planField.value = "starter";
      }

      // Get initial price data for starter plan
      const initialPriceData = getPrice({
        users: configData.users,
        recommendedPlan: "starter",
        planType: "starter", // Force starter plan pricing
      });

      // Populate Email based on dmOnlyComms
      const userEmail = document.getElementById("renewal-form__contact-email");

      if (configData.dmOnlyComms === true) {
        if (userEmail) {
          userEmail.textContent = configData.thisUsersEmail;
        }
      } else {
        if (userEmail) {
          userEmail.textContent = "all renewal contacts at your school";
          userEmail.style.fontWeight = "400";
        }
      }

      updateFormDisplay(initialPriceData);

      // Set up user count change listener
      if (usersField) {
        usersField.addEventListener("input", handleUserCountChange);
      }

      /* --- Exit survey --- */
      const successMessage = document.querySelector(".exit__form .w-form-done");
      const successSection = document.getElementById(
        "calc-cancel-success__container"
      );

      const exitSurveySectionTrigger = document.getElementById(
        "exit-survey__trigger"
      );

      // Exit survey section trigger
      exitSurveySectionTrigger.addEventListener("click", () => {
        cancelSection.style.display = "none";
        exitSurveySection.style.display = "flex";
      });

      // Main form trigger
      cancelSectionTrigger.addEventListener("click", () => {
        cancelSection.style.display = "flex";
        exitSurveySection.style.display = "none";
      });

      // Form success message observer to trigger confirmation message
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.target.style.display === "block") {
            exitSurveySection.style.display = "none";
            successSection.style.display = "flex";
            observer.disconnect();
          }
        });
      });

      if (successMessage) {
        observer.observe(successMessage, {
          attributes: true,
          attributeFilter: ["style"],
        });
      }

      // Populate customer's email address
      const emailAddress = configData.primaryContact.email;
      const emailField = document.getElementById("exit-form__email");
      emailField.value = emailAddress;

      // Populate Renewal Deal ID
      const renewalDealID = configData.renewalDealId;
      const renewalDealField = document.getElementById("exit-form__renewal-id");
      renewalDealField.value = renewalDealID;

      // Activate competitor tool select if selected in the cancellation reason
      const cancelReason = document.getElementById("exit-form__cancel-reason");
      const competitorToolWrapper = document.getElementById(
        "exit-form__tool-choice-wrapper"
      );
      const competitorTool = document.getElementById("exit-form__tool-choice");

      cancelReason.addEventListener("change", (event) => {
        const selectedValue = event.target.value;

        if (selectedValue === "Using a Different Tool") {
          competitorTool.setAttribute("required", "");
          competitorToolWrapper.classList.remove("hidden");
        } else {
          competitorToolWrapper.classList.add("hidden");
          competitorTool.removeAttribute("required", "");
          competitorTool.selectedIndex = 0;
        }
      });
    }
  }

  function handleUserCountChange(event) {
    const userCount = parseInt(event.target.value) || 0;

    // Always get starter plan pricing regardless of current selection
    const priceData = getPrice({
      users: userCount,
      recommendedPlan: "starter",
      planType: "starter", // Force starter plan pricing
    });

    updateFormDisplay(priceData);
  }

  function updateFormDisplay(priceData) {
    // Update quote display
    const quoteDisplay = document.getElementById("renewal-form__quote-display");
    const quoteInput = document.getElementById("cancel-form__quote");
    if (quoteDisplay) {
      quoteDisplay.textContent = priceData.price;
      quoteInput.value = priceData.price;
    }

    // Update discount display
    const discountElement = document.getElementById(
      "renewal-form__discount-number"
    );

    if (discountElement) {
      // Try both possible paths for discount value
      const discountObj =
        priceData.discounts ||
        (priceData.pricing && priceData.pricing.discounts);
      if (discountObj && discountObj.totalDiscount !== undefined) {
        const discountValue = (discountObj.totalDiscount * 100).toFixed(1);

        if (discountValue <= 0 || discountValue === null) {
          discountElement.parentElement.style.display = "none";
        } else {
          discountElement.textContent = discountValue;
        }
      } else {
        // Default to 0 if no discount found
        discountElement.textContent = "0";
      }
    }
  }
}