import { Suspense } from "react";
import SearchResults from "./SearchResults";

export const metadata = {
  title: "Search Results | Newsync",
  description: "Search for the latest news on Newsync",
};

export default function SearchPage() {
  return (
    <div className="container" style={{ padding: "40px 16px", minHeight: "60vh" }}>
      <h1 className="bbc-headline-xl" style={{ borderBottom: "2px solid var(--black)", paddingBottom: "16px", marginBottom: "32px" }}>
        Search Results
      </h1>
      
      <Suspense fallback={<div className="bbc-summary">Searching...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
