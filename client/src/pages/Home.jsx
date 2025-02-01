import React from "react";
import logo from "../components/logo.jpg";
import DropBox from "../components/DropBox";
const Home = () => {
  return (
    <div>
      <div className="bg-[#35130a] h-screen w-screen">
        {/* {logo} */}
        <div className="flex items-center justify-center w-48 ">
          <img
            src={logo}
            alt="Logo"
            className="flex items-center justify-center"
          />
        </div>
        {/* dropBox */}
        <div className="flex items-center justify-center pt-36">
          <DropBox />
        </div>
      </div>
    </div>
  );
};

export default Home;
