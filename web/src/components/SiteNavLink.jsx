import { Link, useLocation } from "react-router-dom";
import styles from "./SiteNavLink.module.css";

export default function SiteNavLink({ to, children, className, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={[styles.link, isActive && styles.active, className].filter(Boolean).join(" ")}
    >
      {children}
    </Link>
  );
}
