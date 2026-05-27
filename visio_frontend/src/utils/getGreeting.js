export const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Bonjour';
  } else if (hour >= 12 && hour < 18) {
    return 'Bon après-midi';
  } else if (hour >= 18 && hour < 22) {
    return 'Bonsoir';
  } else {
    return 'Bonne nuit';
  }
};
