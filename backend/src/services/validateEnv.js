/**
 * Environment Variable Validation
 *
 * Run this on server startup to ensure all required services are configured.
 * Prevents silent failures on Render due to missing env vars.
 *
 * FIXES in this version:
 *   - CLOUDINARY_API_SECRET regex was /^[a-z0-9]+$/i — too strict, excluded
 *     hyphens and underscores that Cloudinary secrets normally contain.
 *     Fixed to /^[a-z0-9_-]+$/i so valid secrets don't crash startup.
 */

const validateEnvironment = () => {
  const requiredVars = [
    { key: "OPENAI_API_KEY",         service: "OpenAI (image generation)",  pattern: /^sk-/ },
    { key: "HF_TOKEN",               service: "HuggingFace (enhancement)",  pattern: /^hf_/ },
    { key: "CLOUDINARY_CLOUD_NAME",  service: "Cloudinary (CDN)",           pattern: /^[a-z0-9-]+$/i },
    { key: "CLOUDINARY_API_KEY",     service: "Cloudinary (CDN)",           pattern: /^[0-9]+$/ },
    // FIXED: was /^[a-z0-9]+$/i — Cloudinary secrets contain hyphens/underscores
    { key: "CLOUDINARY_API_SECRET",  service: "Cloudinary (CDN)",           pattern: /^[a-z0-9_-]+$/i },
  ];

  const optionalVars = [
    { key: "EMAIL_USER",     service: "Gmail SMTP (email)",            pattern: /.+@gmail\.com/ },
    { key: "EMAIL_PASS",     service: "Gmail SMTP (email password)",   pattern: /.+/ },
    { key: "RESEND_API_KEY", service: "Resend API (email alternative)", pattern: /^re_/ },
  ];

  console.log("\n" + "━".repeat(80));
  console.log("ENVIRONMENT VARIABLE VALIDATION");
  console.log("━".repeat(80));

  console.log("\n📋 REQUIRED VARIABLES:");
  let allRequiredValid = true;

  for (const { key, service, pattern } of requiredVars) {
    const value   = process.env[key];
    const isSet   = value && value !== "";
    const isValid = isSet && !value.includes("your_") && pattern.test(value);

    console.log(`  ${isValid ? "✓" : "✗"} ${key}`);
    console.log(`      Service: ${service}`);

    if (!isSet) {
      console.log(`      ⚠️  NOT SET`);
      allRequiredValid = false;
    } else if (!isValid) {
      console.log(`      ⚠️  Invalid format (expected pattern: ${pattern})`);
      allRequiredValid = false;
    } else {
      const masked = value.substring(0, 6) + "..." + value.substring(value.length - 4);
      console.log(`      Value: ${masked}`);
    }
  }

  console.log("\n📋 OPTIONAL VARIABLES:");
  let emailConfigured = false;

  for (const { key, service, pattern } of optionalVars) {
    const value   = process.env[key];
    const isSet   = value && value !== "";
    const isValid = isSet && !value.includes("your_") && pattern.test(value);

    if (isValid) {
      console.log(`  ✓ ${key}`);
      console.log(`      Service: ${service}`);
      const masked = value.substring(0, 6) + "..." + value.substring(value.length - 4);
      console.log(`      Value: ${masked}`);
      if (key.includes("EMAIL") || key.includes("RESEND")) {
        emailConfigured = true;
      }
    } else if (isSet) {
      console.log(`  ✗ ${key} (invalid format)`);
      console.log(`      Service: ${service}`);
    } else {
      console.log(`  ○ ${key} (not configured)`);
      console.log(`      Service: ${service}`);
    }
  }

  console.log("\n📋 RUNTIME ENVIRONMENT:");
  console.log(`  NODE_ENV: ${process.env.NODE_ENV || "development"}`);
  console.log(`  Platform: ${process.env.RENDER ? "Render" : "Local"}`);
  console.log(`  Email enabled: ${emailConfigured ? "Yes" : "No (optional)"}`);
  console.log("\n");

  if (!allRequiredValid) {
    console.error("❌ FATAL: Missing or invalid required environment variables.");
    console.error("\n📍 On Render:");
    console.error("   1. Go to Dashboard > Your Service > Settings > Environment");
    console.error("   2. Add missing variables");
    console.error("   3. Redeploy the service\n");
    process.exit(1);
  }

  console.log("✓ All required environment variables are valid.");

  if (!emailConfigured) {
    console.log(
      "⚠️  Email service not configured (optional — portraits will still generate).\n"
    );
  } else {
    console.log("✓ Email service configured.\n");
  }

  console.log("━".repeat(80) + "\n");
};

/**
 * Check health of critical services at startup.
 * @param {object} services - Map of service name → async health-check function
 * @returns {Promise<object>} Health status of each service
 */
const checkServicesHealth = async (services = {}) => {
  const health = {
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    services:    {},
  };

  console.log("\n📊 SERVICE HEALTH CHECK:");

  for (const [name, checkFn] of Object.entries(services)) {
    try {
      const result = await checkFn();
      health.services[name] = { ...result, status: result.healthy ? "✓" : "⚠️" };
      console.log(`  ${result.healthy ? "✓" : "⚠️"} ${name}: ${result.message}`);
    } catch (err) {
      health.services[name] = { healthy: false, status: "✗", error: err.message };
      console.log(`  ✗ ${name}: ${err.message}`);
    }
  }

  console.log();
  return health;
};

module.exports = {
  validateEnvironment,
  checkServicesHealth,
};