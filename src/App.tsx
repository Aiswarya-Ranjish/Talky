import { Route, Routes } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
// Preloader
import Preloader from './pages/dashboard/PreLoader';

//Page not found
import PageNotFound from './pages/dashboard/PageNotFound';

//Auth
import Login from './Auth/Login';
import ForgotPassword from './Auth/ForgotPassword';

//Dashboard
import DashBoard from './pages/dashboard/DashBoard';
import HomePage from './layout/HomePage';


//User
import UserList from './pages/Users/User-List/List';
import UserEdit from './pages/Users/User-List/Edit';
import ViewUser from './pages/Users/User-List/View';

//Company
import CompanyList from './pages/settings/company/List';
import CreateCompany from './pages/settings/company/Create';
import CompanydetailsEdit from './pages/settings/company/Edit';
import ViewCompany from './pages/settings/company/View';



//purchase-coupon
import PurchaseCouponList from './pages/settings/Purchasecoupon/List';
import CreatePurchaseCoupon from './pages/settings/Purchasecoupon/Create';
import EditPurchasecoupon from './pages/settings/Purchasecoupon/Edit';
import ViewPurchasecoupon from './pages/settings/Purchasecoupon/view';

//user
import StaffList from './pages/Staff/List';
import StaffView from './pages/Staff/View';
import StaffEdit from './pages/Staff/Edit';

//user Recharge
import UserRechargeListPage from './pages/Users/UserRecharge/List';
import ViewUserRecharge from './pages/Users/UserRecharge/View';

//App Notication
import AppNotiicationList from './pages/settings/AppNotification/List';
import AppNotificationCreate from './pages/settings/AppNotification/Create';
import AppNotificationEdit from './pages/settings/AppNotification/Edit';
import AppNotificationView from './pages/settings/AppNotification/View';

//Finacial Year
import FinancialYear from './pages/settings/FinancialYear/List';
import FinancialYearCreate from './pages/settings/FinancialYear/Create';
import FinancialYearEdit from './pages/settings/FinancialYear/Edit';
import FinancialYearView from './pages/settings/FinancialYear/View';

//Category
import Category from './pages/settings/Category/List';
import CategoryCreate from './pages/settings/Category/Create';
import CategoryEdit from './pages/settings/Category/Edit';
import CategoryView from './pages/settings/Category/View';

function App() {

  return (
    <>
      <Routes>
        {/* Preloader */}
        <Route path='/' element={<Preloader />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />

        {/* DashBoard */}
        <Route path="/dashboard" element={<DashBoard />}>
          {/* HomePage */}
          <Route index element={<HomePage />} />

         
         
          {/* User */}
          <Route path="user/user-list" element={<UserList />} />
          <Route path="user/edit-user/:userId" element={<UserEdit />} />
          <Route path="user/view-user/:userId" element={<ViewUser />} />

          {/* User Recharge */}
          <Route path="user/recharge/list" element={<UserRechargeListPage />} />
          <Route path="recharge/view/:purchaseOrderId" element={<ViewUserRecharge />} />

          {/* Company */}
          <Route path="settings/company-list" element={<CompanyList />} />
          <Route path="settings/create-company" element={<CreateCompany />} />
          <Route path="settings/edit-company/:companyId" element={<CompanydetailsEdit />} />
          <Route path="settings/view-company/:companyId" element={<ViewCompany />} />

          {/* Purchase Coupon */}
          <Route path="settings/purchase-coupon-list" element={<PurchaseCouponList />} />
          <Route path="settings/create-purchasecoupon" element={<CreatePurchaseCoupon />} />
          <Route path="settings/edit-purchasecoupon/:purchaseCouponId" element={<EditPurchasecoupon />} />
          <Route path="settings/view-purchasecoupon/:purchaseCouponId" element={<ViewPurchasecoupon />} />
          {/* Staff */}
          <Route path="staff/staff-list" element={<StaffList />} />
          <Route path="staff/staff-view/:staffUserId" element={<StaffView />} />
          <Route path="staff/staff-edit/:staffUserId" element={<StaffEdit />} />

          {/*App Notificatin*/}
          <Route path="settings/appNotification-list" element={<AppNotiicationList />} />
          <Route path="settings/create-appNotification" element={< AppNotificationCreate />} />
          <Route path="settings/edit-appNotification/:appNotificationId" element={< AppNotificationEdit />} />
          <Route path="settings/view-appNotification/:appNotificationId" element={< AppNotificationView />} />

          {/*Financial Year */}
          <Route path="settings/financial-year" element={<FinancialYear />} />
          <Route path="settings/create-financialYear" element={< FinancialYearCreate />} />
          <Route path="settings/edit-financialYear/:financialYearId" element={< FinancialYearEdit />} />
          <Route path="settings/view-financialYear/:financialYearId" element={< FinancialYearView />} />

          {/*Category  */}
          <Route path="settings/Category" element={<Category />} />
          <Route path="settings/create-Category" element={< CategoryCreate />} />
          <Route path="settings/edit-Category/:categoryId" element={< CategoryEdit />} />
         
          <Route path="settings/view-Category/:categoryId" element={< CategoryView />} />

        </Route>
        {/* Catch-All Route for 404 */}
        <Route path='*' element={<PageNotFound />} />


      </Routes>
    </>
  )
}

export default App
