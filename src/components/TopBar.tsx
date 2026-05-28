import { Link, NavLink } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import homeIcon from "../images/home.svg";
import favIcon from "../images/removefav.svg";
import archiveIcon from "../images/removearchive.svg";
import settingsIcon from "../images/settings.svg";

const navItems = [
  { to: "/home", label: "Home", icon: homeIcon },
  { to: "/favorites", label: "Favorites", icon: favIcon },
  { to: "/archives", label: "Archives", icon: archiveIcon },
  { to: "/settings", label: "Settings", icon: settingsIcon }
];

export default function TopBar() {
  return (
    <header className="topbar" aria-label="Primary">
      <Link to="/home" className="topbar__brand">
        Locket
      </Link>
      <nav className="topbar__nav">
        {navItems.map((item) => (
          <OverlayTrigger
            key={item.to}
            placement="bottom"
            trigger={["hover"]}
            overlay={<Tooltip>{item.label}</Tooltip>}
          >
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `nav-link${isActive ? " nav-link--active" : ""}`
              }
            >
              <img
                src={item.icon}
                alt=""
                aria-hidden="true"
                className="nav-link__icon"
              />
              <span className="nav-link__label">{item.label}</span>
            </NavLink>
          </OverlayTrigger>
        ))}
      </nav>
    </header>
  );
}
