// Script to update Footer component colors
// This will be applied to src/components/Footer.jsx

// Replace all instances of hardcoded colors with new color classes
const replacements = [
  // Contact info colors
  { from: "style={{ color: '#DCC9A7' }}", to: "text-on-black" },
  { from: "style={{ color: '#8A724C' }}", to: "text-on-black" },
  
  // Headings
  { from: "style={{ color: '#DCC9A7' }}", to: "text-on-black" },
  
  // Social media icons
  { from: "style={{ color: '#DCC9A7' }}", to: "text-on-black" },
  
  // Links
  { from: "style={{ color: '#DCC9A7' }}", to: "text-on-black" },
  
  // Copyright text
  { from: "style={{ color: '#DCC9A7' }}", to: "text-on-black" },
  
  // Hover states - these will be handled by CSS
  { from: "onMouseEnter={(e) => e.target.style.color = '#B99668'}", to: "" },
  { from: "onMouseLeave={(e) => e.target.style.color = '#DCC9A7'}", to: "" },
];

// Apply replacements
replacements.forEach(({ from, to }) => {
  // This would be applied to the actual file
  console.log(`Replace: ${from} -> ${to}`);
});
