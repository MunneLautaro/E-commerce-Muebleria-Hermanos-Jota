import { buildPageTitle } from "./pageTitle"

const toAbsoluteUrl = (path) => new URL(path, globalThis.location.origin).href

export const PageMeta = ({ title, description, noIndex = false, canonicalPath }) => (
  <>
    <title>{buildPageTitle(title)}</title>
    {description && <meta name="description" content={description} />}
    {noIndex && <meta name="robots" content="noindex, nofollow" />}
    {canonicalPath && (
      <link rel="canonical" href={toAbsoluteUrl(canonicalPath)} />
    )}
  </>
)
