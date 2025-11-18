// jQuery-specific fixes for browser extensions
// Use regular functions instead of arrow functions to preserve 'this' context

// ❌ BAD - Arrow functions break 'this' in jQuery
$('.salon-element').each((index, element) => {
  // 'this' is not the DOM element here
  const child = this.querySelector('.child'); // ERROR: this is undefined
});

// ✅ GOOD - Regular functions preserve 'this'
$('.salon-element').each(function(index, element) {
  // 'this' is the DOM element here
  const child = this.querySelector('.child');
  if (!child) return;
  
  // Your logic here
  console.log('Found child element:', child);
});

// ✅ ALTERNATIVE - Use the element parameter
$('.salon-element').each(function(index, element) {
  const child = element.querySelector('.child');
  if (!child) return;
  
  // Your logic here
});

// Event handlers - same principle
// ❌ BAD
$('.salon-button').on('click', (event) => {
  const target = this; // ERROR: this is not the button
});

// ✅ GOOD
$('.salon-button').on('click', function(event) {
  const target = this; // 'this' is the button element
  if (!target) return;
  
  // Your logic here
});

// ✅ ALTERNATIVE - Use event.target
$('.salon-button').on('click', function(event) {
  const target = event.target;
  if (!target) return;
  
  // Your logic here
});
