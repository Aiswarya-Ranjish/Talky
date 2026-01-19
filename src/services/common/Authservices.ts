// src/services/common/Authservices.ts
import HttpService from "./HttpService";
import type { CustomResponse } from "../../types/common/ApiTypes";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import type { 
  ForgotPasswordRequest, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  CurrentUserResponse
} from "../../types/common/Auth.types";

class AuthService {
  // ✅ Login
  static async login(credentials: LoginRequest): Promise<CustomResponse<LoginResponse>> {
    try {
      const response = await HttpService.callApi<CustomResponse<LoginResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        "POST",
        credentials,
        true // isPublic - no token needed for login
      );

      console.log('API Response:', response);

      // Store token in localStorage if login successful
      if (response.isSucess && response.value) {
        console.log('Login successful, storing data...');

        // Store token FIRST
        if (response.value.token) {
          localStorage.setItem('jwt_token', response.value.token);
          console.log('Token stored:', localStorage.getItem('jwt_token') !== null);
        }

        // Store token expiry
        if (response.value.expiresAt) {
          localStorage.setItem('token_expires_at', response.value.expiresAt);
          console.log('Expiry stored:', localStorage.getItem('token_expires_at') !== null);
        }

        // Store initial user data
        if (response.value.user) {
          const userString = JSON.stringify(response.value.user);
          localStorage.setItem('user', userString);
          console.log('User stored:', localStorage.getItem('user') !== null);
          console.log('Stored user data:', localStorage.getItem('user'));
        }

        // Verify storage
        console.log('Storage verification:');
        console.log('- jwt_token exists:', !!localStorage.getItem('jwt_token'));
        console.log('- user exists:', !!localStorage.getItem('user'));
        console.log('- token_expires_at exists:', !!localStorage.getItem('token_expires_at'));
      } else {
        console.error('Login failed - response not successful or no value');
      }

      return response;
    } catch (error) {
      console.error('Login error in AuthService:', error);
      throw error;
    }
  }

  // ✅ Refresh User Data After Login (call this after navigation)
  static async refreshUserDataAfterLogin(): Promise<void> {
    try {
      console.log('Refreshing user data after login...');
      const freshUserResponse = await this.getCurrentUserFromAPI();
      if (freshUserResponse.isSucess && freshUserResponse.value) {
        console.log('Fresh user data fetched:', freshUserResponse.value);
        localStorage.setItem('user', JSON.stringify(freshUserResponse.value));
        
        // Dispatch event to notify all components
        console.log('Dispatching profileUpdated event');
        window.dispatchEvent(new CustomEvent("profileUpdated"));
        
        // Also dispatch with a small delay to ensure all components are mounted
        setTimeout(() => {
          console.log('Dispatching delayed profileUpdated event');
          window.dispatchEvent(new CustomEvent("profileUpdated"));
        }, 100);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }

  // ✅ Register
  static async register(data: RegisterRequest): Promise<CustomResponse<LoginResponse>> {
    try {
      const response = await HttpService.callApi<CustomResponse<LoginResponse>>(
        API_ENDPOINTS.AUTH.REGISTER,
        "POST",
        data,
        true // isPublic - no token needed for registration
      );

      // Optionally auto-login after registration
      if (response.isSucess && response.value) {
        if (response.value.token) {
          localStorage.setItem('jwt_token', response.value.token);
        }
        if (response.value.user) {
          localStorage.setItem('user', JSON.stringify(response.value.user));
        }
        if (response.value.expiresAt) {
          localStorage.setItem('token_expires_at', response.value.expiresAt);
        }
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // ✅ Logout
  static async logout(): Promise<void> {
    console.log('Logging out...');
    
    try {
      // Call logout endpoint
      await HttpService.callApi<CustomResponse<void>>(
        API_ENDPOINTS.AUTH.LOGOUT,
        "POST",
        {}
      );
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API call fails
    }

    // Clear local storage
    console.log('Before logout - jwt_token:', localStorage.getItem('jwt_token') !== null);
    console.log('Before logout - user:', localStorage.getItem('user') !== null);

    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expires_at');

    console.log('After logout - jwt_token:', localStorage.getItem('jwt_token') !== null);
    console.log('After logout - user:', localStorage.getItem('user') !== null);
    console.log('Logout complete');
  }

  // ✅ Forgot Password
  static async forgotPassword(data: ForgotPasswordRequest): Promise<CustomResponse<void>> {
    return await HttpService.callApi<CustomResponse<void>>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      "POST",
      data,
      true // public endpoint (no token required)
    );
  }

  // ✅ Reset Password
  static async resetPassword(data: ResetPasswordRequest): Promise<CustomResponse<void>> {
    return await HttpService.callApi<CustomResponse<void>>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      "POST",
      data,
      true // public endpoint (no token required)
    );
  }

  // ✅ Change Password
  static async changePassword(data: ChangePasswordRequest): Promise<CustomResponse<void>> {
    try {
      const response = await HttpService.callApi<CustomResponse<void>>(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        "POST",
        data
      );
      return response;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  // ✅ Get Current User (from /api/UserAuth/me)
  static async getCurrentUserFromAPI(): Promise<CustomResponse<CurrentUserResponse>> {
    try {
      const response = await HttpService.callApi<CustomResponse<CurrentUserResponse>>(
        API_ENDPOINTS.AUTH.ME,
        "GET"
      );
      
      // Update local storage with fresh user data
      if (response.isSucess && response.value) {
        localStorage.setItem('user', JSON.stringify(response.value));
        console.log('User data updated in localStorage from API');
      }
      
      return response;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  }

  // ✅ Get Current User from LocalStorage
  static getCurrentUser(): any | null {
    try {
      const userStr = localStorage.getItem('user');
      console.log('Getting current user, raw string:', userStr);

      if (!userStr) {
        console.log('No user found in localStorage');
        return null;
      }

      const user = JSON.parse(userStr);
      console.log('Parsed user:', user);
      return user;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  // ✅ Get Token
  static getToken(): string | null {
    const token = localStorage.getItem('jwt_token');
    console.log('Getting token, exists:', token !== null);
    return token;
  }

  // ✅ Check Authentication Status
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('jwt_token');
    console.log('Checking authentication, token exists:', token !== null);

    if (!token) {
      console.log('Not authenticated - no token');
      return false;
    }

    // Check if token is expired
    const expiresAt = localStorage.getItem('token_expires_at');
    if (expiresAt) {
      const expiryDate = new Date(expiresAt);
      const now = new Date();
      console.log('Token expiry check:', { expiryDate, now, expired: now >= expiryDate });

      if (now >= expiryDate) {
        console.log('Token expired, logging out');
        this.logout();
        return false;
      }
    }

    console.log('User is authenticated');
    return true;
  }
}

export default AuthService;