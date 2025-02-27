import React from 'react';
import { getUserOnboardingStatus } from '@/actions/user';
import { redirect } from 'next/navigation';
import { getIndustryInsights } from '@/actions/dashboard';
import DashboardView from './_components/DashboardView';

const IndustryInsightsPage = async() => {

  const {isOnboarded} = await getUserOnboardingStatus();
  
    if(!isOnboarded){
      redirect("/onboarding");
    }
    
    try {
      const insights = await getIndustryInsights();
      return (
        <div className='container mx-auto'>
          <DashboardView insights={insights}/>
        </div>
      );
    } catch (error) {
      if (error.message === "Industry parameter is required") {
        redirect("/onboarding");
      }
      throw error; 
    }

}

export default IndustryInsightsPage
