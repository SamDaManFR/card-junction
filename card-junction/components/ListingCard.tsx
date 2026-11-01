"use client";

import Image from "next/image";
import { useState } from "react";
import { extractPsaGradeAndCert } from "@/lib/parse";

export type Listing = {
  itemId: string;
  title: string;
  itemWebUrl: string;
  image?: { imageUrl: string };
  thumbnailImages?: Array<{ imageUrl: string }>;
  price?: { value: string; currency: string };
  itemEndDate?: string;
  buyingOptions?: string[];
};

export function money(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export default function ListingCard({
  item,
  external = false,
}: {
  item: Listing;
  external?: boolean;
}) {
  const [failedImage, setFailedImage] = useState("");
  // Browse search supplies the larger primary photo in thumbnailImages.
  const imageUrl = item.thumbnailImages?.[0]?.imageUrl || item.image?.imageUrl;
  const { psaGrade, psaCert } = extractPsaGradeAndCert(item.title);
  const amount = item.price?.value.trim() ? Number(item.price.value) : NaN;
  const end = item.itemEndDate ? new Date(item.itemEndDate) : null;
  const validEnd = end && Number.isFinite(end.getTime());
  return (
    <a
      className="listing-card"
      href={
        external ? item.itemWebUrl : `/items/${encodeURIComponent(item.itemId)}`
      }
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      <div className="listing-image">
        {imageUrl && failedImage !== imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.title}
            width={480}
            height={640}
            sizes="(max-width: 639px) 90vw, (max-width: 1079px) 44vw, 360px"
            onError={() => setFailedImage(imageUrl)}
          />
        ) : (
          <span className="image-placeholder">Image unavailable</span>
        )}
        <span className="listing-source">eBay listing</span>
      </div>
      <div className="listing-body">
        <div className="listing-badges">
          <span className="grade-badge">
            {psaGrade ? `PSA ${psaGrade}` : "Grade unspecified"}
          </span>
          <span>
            {item.buyingOptions
              ?.map((option) =>
                option === "AUCTION"
                  ? "Auction"
                  : option === "FIXED_PRICE"
                    ? "Buy It Now"
                    : option.replaceAll("_", " "),
              )
              .join(" · ") || "Buying format unspecified"}
          </span>
        </div>
        <h3 className="listing-title" title={item.title}>
          {item.title}
        </h3>
        <div className="listing-price">
          {Number.isFinite(amount) && amount >= 0 && item.price
            ? money(amount, item.price.currency)
            : "Price unavailable"}
        </div>
        <div className="listing-price-label">
          {item.price?.currency || ""} · Active listing price
        </div>
        <div className="listing-footer">
          <span>
            {validEnd ? (
              <>
                Ends{" "}
                <time dateTime={end.toISOString()}>
                  {end.toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "UTC",
                  })}{" "}
                  UTC
                </time>
              </>
            ) : (
              "No end time provided"
            )}
            <small>
              Grade{psaCert ? ` · Cert ${psaCert}` : ""} from listing title;
              unverified
            </small>
          </span>
          <span aria-hidden="true">↗</span>
        </div>
      </div>
    </a>
  );
}
