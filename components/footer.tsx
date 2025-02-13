import { APP_NAME } from "@/lib/constants";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bordet-t">
            <div className="p-5 flex-center text-xs text-muted-foreground">
                {currentYear} {APP_NAME}&copy; All rights reserved
            </div>
        </footer>
    );
}

export default Footer;