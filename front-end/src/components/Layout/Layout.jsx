import { Outlet } from "react-router";

import Header from '../header/header.jsx'
import Footer from '../footer/footer.jsx'

const Layout = () => {
    return (
        <>
            <Header/>
                <section className="relative z-0">
                    <Outlet/>
                </section>
            <Footer/>
        </>
    )
}

export default Layout