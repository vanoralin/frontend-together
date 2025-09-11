import RoleBar from "@/app/role_bar";

interface HeaderProps {
  username: string;
  role: number;
}

function Background() {
  return (
    <div className="min-h-screen w-full bg-[#C5DEDA] flex flex-col items-center">
      <Block_profileuser username="เตา อั่งโล่" role={1} />
      <Block_listitem_profile />
      <Block_logout />
    </div>
  );
}

function Block_profileuser({ username, role }: HeaderProps) {
  return (
    <div className="h-[198px] w-[366px] bg-white rounded-[30px] shadow-md mt-20 flex flex-col justify-center">
      {/* Row: avatar + middle content + arrow */}
      <div className="flex items-center ">
        {/* Left: user avatar */}
        <img
          src="/user.svg"
          alt="user icon"
          className="h-[132px] w-[132px] rounded-full object-cover ml-2"
        />

        {/* Middle: username + gender + role + switch + email */}
        <div className="flex flex-col ml-1 mr-2">
          <div className="flex items-center">
            <p className="text-2xl mb-1">{username}</p>
            <img
              src="/male.svg"
              alt="male icon"
              className="h-7 w-7 ml-1"
            />
          </div>

          <div className="flex items-center mb-1">
            <RoleBar role={role} />
            <img
              src="/switch.svg"
              alt="switch"
              className="h-8 w-8 ml-1"
            />
          </div>

          <p className="text-lg">6xxxxxxx@kmitl.ac.th</p>
        </div>

        {/* Right: next arrow (pushes itself to far right) */}
        <img
          src="/vector_next.svg"
          alt="next"
          className="h-6 w-6 mr-2"
        />
      </div>
    </div>
  );
}

function Block_listitem_profile() {
  return (
    <div>
      <div className="h-[82px] w-[366px] bg-white rounded-t-[20px] shadow-md mt-5 flex items-center px-4">
        <p className="text-2xl">กระเป๋าเงิน</p>
        <div className="ml-10 h-[51px] w-[145px] bg-[rgba(181,91,50,0.8)] rounded-[20px] flex justify-center items-center">
          <img src="/coin.svg" alt="coin icon" className="h-6 w-6 mr-2" />
          <p className="text-2xl">100.00</p>
        </div>
        <img src="/vector_next.svg" alt="next" className="h-6 w-6 ml-auto" />
      </div>

      <div className="h-[82px] w-[366px] bg-white shadow-md mt-1 flex items-center px-4">
        <p className="text-2xl">ทริปขาประจำ</p>
        <img src="/vector_next.svg" alt="next" className="h-6 w-6 ml-auto" />
      </div>

      <div className="h-[82px] w-[366px] bg-white shadow-md mt-1 flex items-center px-4">
        <p className="text-2xl">ประวัติการเดินทาง</p>
        <img src="/vector_next.svg" alt="next" className="h-6 w-6 ml-auto" />
      </div>

      <div className="h-[82px] w-[366px] bg-white rounded-b-[20px] shadow-md mt-1 flex items-center px-4">
        <p className="text-2xl">แจ้งปัญหา</p>
        <img src="/help.svg" alt="help" className="h-6 w-6 ml-2" />
        <img src="/vector_next.svg" alt="next" className="h-6 w-6 ml-auto" />
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

export default Background;
export { Block_listitem_profile, Block_logout, Block_profileuser };
