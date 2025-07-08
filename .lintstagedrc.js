module.exports = {
  // Lint and format JavaScript files
  '*.js': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // Format JSON files
  '*.json': [
    'prettier --write',
  ],
  
  // Format Markdown files
  '*.md': [
    'prettier --write',
  ],
  
  // Run tests if test files are changed
  '**/*.test.js': [
    'npm test -- --findRelatedTests',
  ],
}; 