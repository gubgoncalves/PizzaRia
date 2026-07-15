import Navbar from "./Navbar";
import "../styles/dashboard.css";

function DashboardLayout({children}){

    return(
        <div className="dashboard">

            <Navbar />

            <main className="dashboard-content">
                {children}
            </main>

        </div>
    )
}

export default DashboardLayout;