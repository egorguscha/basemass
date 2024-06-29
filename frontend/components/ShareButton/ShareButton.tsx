import Link from "next/link";
import TwitterIcon from "@mui/icons-material/Twitter";

const ShareButton = ({ children, ...queryParams }) => (
  <>
    <Link
      href={{
        pathname: "https://twitter.com/intent/tweet",
        query: { ...queryParams },
      }}
      className="btn btn--with-icon btn--last-game-stats"
      target="_blank"
    >
      <TwitterIcon />
      {children}
    </Link>
  </>
);

export default ShareButton;
