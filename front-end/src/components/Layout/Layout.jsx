import { Outlet } from "react-router";

import Header from '../Header/Header.jsx';
import Footer from '../footer/footer.jsx';
import InvitationSystem from "../InvitationSystem.jsx";

const Layout = () => {
    return (
        <>
            <Header/>
                <section>
                    <Outlet/>
                </section>
            <Footer/>
            <InvitationSystem/>
        </>
    )
}

export default Layout