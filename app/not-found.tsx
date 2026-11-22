import Link from "next/link";
export default function NotFound() {
  return <div className="wrap" style={{ padding: "180px 18px 120px" }}><h1 className="h-xl">This bed is empty.</h1><p className="lede mute" style={{ margin: "14px 0 24px" }}>The page you were looking for has not sprouted.</p><Link className="btn green" href="/shop">Shop plants</Link></div>;
}
