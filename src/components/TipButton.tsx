import React from 'react';

const TipButton = () => {
  return (
    <form action="https://www.paypal.com/donate" method="post" target="_blank" className="mt-4">
      <input type="hidden" name="business" value="joshuadverni@gmail.com" />
      <input type="hidden" name="currency_code" value="USD" />
      <input type="hidden" name="item_name" value="Chungus Numbers Game Tip" />
      <button 
        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 
                   transition-all transform hover:scale-105 shadow-md"
        type="submit"
      >
        Enjoyed the game? Buy me a coffee! ☕
      </button>
    </form>
  );
};

export default TipButton;