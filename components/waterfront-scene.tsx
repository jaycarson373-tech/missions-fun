/** Original BOUNTY environment art. Intentionally separate from the brand/logo. */
export default function WaterfrontScene() {
  return <div className="waterfront-scene" aria-hidden="true">
    <picture>
      <source media="(max-width: 600px)" srcSet="/art/bounty-waterfront-mobile.webp"/>
      <img src="/art/bounty-waterfront.webp" width="2048" height="1024" alt="" fetchPriority="high"/>
    </picture>
    <div className="waterfront-light"/>
  </div>;
}
