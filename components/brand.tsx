import Link from "next/link"

export function Brand({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className={`brand-lockup ${light ? "brand-lockup-light" : ""}`} aria-label="Hayes and Ride home">
      <span className="brand-monogram" aria-hidden="true">H</span>
      <span><strong>Hayes</strong><i>&amp;</i><strong>Ride</strong></span>
    </Link>
  )
}
