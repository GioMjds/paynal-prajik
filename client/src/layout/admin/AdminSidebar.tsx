import React, { Suspense, useState, useEffect, FC } from "react";
import { fetchAdminProfile } from "../../services/Admin";
import { menuItems } from "../../constants/AdminMenuSidebar";
import AdminDetailSkeleton from "../../motions/skeletons/AdminDetailSkeleton";
import { useUserContext } from "../../contexts/AuthContext";
import Modal from "../../components/Modal";
import { logout } from "../../services/Auth";
import { useNavigate, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const AdminProfile = React.lazy(() => import("./AdminProfile"));

interface AdminData {
  name: string;
  role: string;
  profile_pic: string;
}

const AdminSidebar: FC<{ role: string }> = ({ role }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { setIsAuthenticated, setRole } = useUserContext();

  const [admin, setAdmin] = useState<AdminData>({
    name: "",
    role: "",
    profile_pic: "",
  });

  const modalCancel = () => setIsModalOpen(!isModalOpen);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await logout();
      if (response.status === 200) {
        setIsAuthenticated(false);
        setRole("");
        navigate("/");
      }
      setLoading(false);
    } catch (error) {
      console.error(`Failed to logout: ${error}`);
    }
  };

  useEffect(() => {
    const adminProfile = async () => {
      try {
        const response = await fetchAdminProfile();
        setAdmin(response.data.data);
      } catch (error) {
        console.error(`Failed to fetch admin profile: ${error}`);
      }
    };
    adminProfile();
  }, []);

  const filteredMenuItems = menuItems.filter((item) => {
    if (role.toLowerCase() === "staff") {
      if (
        item.label === "Dashboard" ||
        item.label === "Manage Staff" ||
        item.label === "Reports & Analytics"
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <>
      <aside className="min-h-screen flex flex-col p-2 bg-white text-black z-40 shadow-lg">
        <div className="p-4">
          <Suspense fallback={<AdminDetailSkeleton />}>
            {admin ? <AdminProfile admin={admin} /> : <AdminDetailSkeleton />}
          </Suspense>
        </div>
        <div className="flex-grow overflow-y-auto p-2">
          <ul className="space-y-4">
            {filteredMenuItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.link}
                  end={item.link === "/admin"}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 justify-baseline rounded-md cursor-pointer ${isActive
                      ? "border-r-3 border-blue-600 bg-blue-100/80 text-blue-700 font-bold"
                      : "hover:bg-black/15"
                    }`
                  }
                >
                  <FontAwesomeIcon
                    icon={item.icon}
                    className="text-2xl p-2 w-5 h-5 text-left"
                  />{" "}
                  <span className="text-md">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-3 py-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center space-x-3 py-2 px-3 rounded-md transition-all duration-300 text-red-600 hover:bg-black/15 cursor-pointer"
          >
            <i className="fa fa-sign-out-alt font-light"></i>
            <span className="font-bold uppercase">Log Out</span>
          </button>
        </div>
      </aside>
      <Modal
        isOpen={isModalOpen}
        icon="fas fa-sign-out-alt"
        title="Log Out"
        description="Are you sure you want to log out?"
        cancel={modalCancel}
        onConfirm={handleLogout}
        loading={loading}
        className={`bg-red-600 text-white hover:bg-red-700 font-bold uppercase text-sm px-6 py-3 rounded-md shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-300 cursor-pointer ${loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        confirmText={
          loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Logging out...
            </>
          ) : (
            "Log Out"
          )
        }
        cancelText="Cancel"
      />
    </>
  );
};

export default AdminSidebar;
