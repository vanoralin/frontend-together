function Background() {
  return (
    <div className="min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center">
      {/* <Block_profileuser /> 
      <Popup_logout />
      <Block_listitem_profile />
      <Block_logout />
      <Profile_wallet /> */}
      <Block_history />
    </div>
  );
}

function Block_profileuser() {
  return (
    <div className="h-[198px] w-[366px] bg-white rounded-[30px] shadow-md mt-20">
      <p className="text-lg text-center">ชื่อ</p>
    </div>
  );
}

function Block_listitem_profile() {
  return (
    <div>
    <div className="h-[82px] w-[366px] bg-white rounded-t-[20px] shadow-md mt-5 flex items-center px-4">
      <p className="text-2xl">กระเป๋าเงิน</p>
      <div className="ml-10 h-[51px] w-[145px] bg-[rgba(181,91,50,0.8)] rounded-[20px] flex justify-center items-center">
        <img src="/public/dollar.png" alt="icon" className="h-6 w-6 mr-2" />
        <p className="text-2xl">100.00</p>
      </div>
       <img src="/public/right.png" alt="icon" className="h-6 w-6 ml-auto" />
    </div>
    <div className="h-[82px] w-[366px] bg-white shadow-md mt-1 flex items-center px-4">
      <p className="text-2xl">ทริปขาประจำ</p>
      <img src="/public/right.png" alt="icon" className="h-6 w-6 ml-auto" />
    </div>
    <div className="h-[82px] w-[366px] bg-white shadow-md mt-1 flex items-center px-4">
      <p className="text-2xl">ประวัติการเดินทาง</p>
      <img src="/public/right.png" alt="icon" className="h-6 w-6 ml-auto" />
    </div>
    <div className="h-[82px] w-[366px] bg-white rounded-b-[20px] shadow-md mt-1 flex items-center px-4">
      <p className="text-2xl">แจ้งปัญหา</p>
      <img src="/public/exclamation.png" alt="icon" className="h-6 w-6 ml-2" />
      <img src="/public/right.png" alt="icon" className="h-6 w-6 ml-auto" />
    </div>
    </div>
  );
}


function Block_logout() {
  return (
    <div className="h-[60px] w-[366px] bg-white rounded-full shadow-md mt-12 flex items-center justify-center px-6">
      <p className="text-center text-red-600 text-2xl">ออกจากระบบ</p>
    </div>
  );
}

function Popup_logout() {
  return (
    <div className="h-[144px] w-[366px] bg-white rounded-[30px] shadow-md">
      <p className="text-lg text-center mt-4">แน่ใจไหมว่าต้องการออกจากระบบ?</p>
      <div className="flex justify-center space-x-10">
        <button className="mt-4 px-6 py-2 rounded-full bg-[#FFFFFF] border-2 border-[#8B8B8B] font-medium shadow-md hover:bg-gray-300 transition text-xl">
            ยกเลิก
        </button>
        <button className="mt-4 px-8 py-2 rounded-full bg-[#E6A88A] border-2 border-[#B55C32] font-medium shadow-md hover:bg-red-600 transition text-xl">
            ตกลง
        </button>
    </div>
    </div>
  );
}

function Profile_wallet() {
  return (
    <div className="h-[142px] w-[366px] bg-white rounded-[30px] shadow-md mt-20 p-4 flex items-center">
      {/* Avatar */}
      <img
        src="/public/user.png"
        alt="icon"
        className="h-[110px] w-[110px] rounded-full object-cover ml-3"
      />

      {/* Right side (name + coin stacked vertically) */}
      <div className="flex flex-col ml-6">
        {/* Name */}
        <p className="text-2xl flex items-center font-medium">
          เตา อั่งโล่
          <img
            src="/public/male.png"
            alt="male"
            className="h-7 w-7 inline-block ml-2"
          />
        </p>

        {/* Coin */}
        <div className="mt-3 h-[51px] w-[145px] bg-[rgba(181,91,50,0.8)] rounded-[20px] flex justify-center items-center">
          <img src="/public/dollar.png" alt="icon" className="h-6 w-6 mr-2" />
          <p className="text-2xl mb-1.5">100.00</p>
        </div>
      </div>
    </div>
  );
}

function Block_history() {
  return (
    <div className="h-[139px] w-[366px] bg-white rounded-[30px] shadow-md mt-5 p-3">
    <div className="flex mt-1 mb-1">
      <div className="flex flex-col items-center mt-2">
        <img src="./public/mood.png" alt="icon" className="h-5 w-6" />
        <div className="h-7.5 border-l-2 border-dashed border-gray-400"></div>
        <img src="./public/mood.png" alt="icon" className="h-5 w-6" />
    </div>


    <div className="ml-2 flex flex-col justify-between">
      <div className="flex items-center">
        <div className="h-[33px] w-[219px] bg-[rgba(139,139,139,0.15)] rounded-2xl flex items-center px-3">
          <p className="ml-3">ฝั่งตรงข้ามเกกี4</p>
        </div>
        <div className="h-[33px] w-[90px] bg-[rgba(181,91,50,0.8)] rounded-[15px] flex justify-center items-center ml-1.5">
          <img src="./public/dollar.png" alt="icon" className="h-4 w-4 mr-1" />
          <p className="text-[17px]">100.00</p>
        </div>
      </div>


      <div className="flex items-center mt-5">
        <div className="h-[33px] w-[219px] bg-[rgba(139,139,139,0.15)] rounded-2xl flex items-center px-3">
          <p className="ml-3">หน้าตึก ECC</p>
        </div>
        <div className="h-[33px] w-[90px] bg-white rounded-[15px] border-gray-600 border-1 flex justify-center items-center ml-1.5">
          <p className="text-[17px]">3</p>
          <img src="./public/human.png" alt="icon" className="h-4 w-4 ml-1" />
        </div>
      </div>
    </div>
  </div>

  <div className="flex mt-2 mb-2">
    <img src="./public/calendar.png" className="h-5 w-5 ml-1" />
    <p className="ml-2 text-sm text-gray-500">12/12/2023</p>
  </div>
</div>

  );
}


export { Background, Block_listitem_profile, Block_logout, Block_profileuser, Popup_logout, Profile_wallet, Block_history };
