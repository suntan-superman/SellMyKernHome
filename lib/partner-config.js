import "server-only";

function parseRecipients(value) {
  if (!value?.trim()) return [];
  try {
    const recipients = JSON.parse(value);
    if (!Array.isArray(recipients)) return [];
    return recipients
      .filter((item) => item && typeof item.id === "string" && typeof item.name === "string")
      .map((item) => ({ id: item.id.trim().slice(0, 80), name: item.name.trim().slice(0, 160) }))
      .filter((item) => item.id && item.name);
  } catch {
    return [];
  }
}

export function getPartnerDeliveryConfiguration() {
  const approvedRecipients = parseRecipients(process.env.SMKH_APPROVED_SHARING_RECIPIENTS || "");
  const deliveryEnabled = process.env.SMKH_PARTNER_DELIVERY_ENABLED === "true";
  return {
    approvedRecipients,
    deliveryEnabled,
    sharingAvailable: deliveryEnabled && approvedRecipients.length > 0,
  };
}
