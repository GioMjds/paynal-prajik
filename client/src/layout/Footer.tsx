import { Link } from "react-router-dom";
import hotel_logo from "../assets/hotel_logo.png";
import { footerLinks } from "../constants/Footer";

const Footer = () => {
  return (
    <footer className="relative bg-gray-100 px-6 md:px-15 py-5 font-montserrat">
      <img
        loading="lazy"
        src={hotel_logo}
        className="h-10 w-auto cursor-pointer mb-3"
      />
      <div className="px-5">
        <i className="fa-solid fa-location-dot text-violet-600"></i>
        <h6 className="inline-block ml-1 text-sm italic mb-5">
          Brgy. Bubukal Sta. Cruz, Laguna
        </h6>

        {/* Footer Sections */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-8 py-2">
          {footerLinks.map((section, sectionIndex) => (
            <div key={sectionIndex} className="text-left">
              <h1 className="text-base font-semibold">{section.title}</h1>
              <ul className="pt-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex} className="text-sm pt-2">
                    <Link
                      to={link.to}
                      className="text-purple-600 hover:underline transition-all duration-300"
                    >
                      {link.links}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div className="text-left">
            <h1 className="text-base font-semibold">Contact</h1>
            <ul className="pt-2 space-y-2 flex flex-col items-start">
              <li className="flex items-center gap-2 text-sm">
                <i className="fas fa-phone"></i> 098-765-4321
              </li>
              <li className="flex items-center gap-2 text-sm">
                <i className="fas fa-envelope"></i> azureahotelmanagement@gmail.com
              </li>
            </ul>
          </div>

          {/* Social Media (Wrapped on smaller screens) */}
          <div className="col-span-2 md:col-span-1 text-left sm:text-left">
            <h1 className="text-base font-semibold">Follow Us</h1>
            <div className="flex flex-wrap justify-start gap-3 pt-4">
              <i className="fa-brands fa-instagram text-xl transition-all duration-300 border border-gray-800 p-2 rounded-full hover:bg-black hover:text-white"></i>
              <i className="fa-brands fa-facebook-f text-xl transition-all duration-300 border border-black p-2 px-3 rounded-full hover:text-white hover:bg-blue-500"></i>
              <i className="fa-brands fa-x-twitter text-xl transition-all duration-300 border border-black p-2 rounded-full hover:text-white hover:bg-black"></i>
              <i className="fa-brands fa-tiktok text-xl transition-all duration-300 border border-black p-2 rounded-full hover:text-white hover:bg-black"></i>
              <i className="fa-brands fa-linkedin-in text-xl transition-all duration-300 border border-black p-2 rounded-full hover:bg-[#0077b5] hover:text-white"></i>
            </div>
          </div>
        </section>

        {/* Bottom Section */}
        <section className="flex flex-col md:flex-row justify-center items-center py-5 border-t-2 border-gray-200 mt-7 gap-3 text-center md:text-left">
          <h1 className="text-md">
            &copy; {new Date().getFullYear()} Azurea Hotel Management System &trade; | All rights reserved.
          </h1>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
