import { CodeGuardianAnalyzer, createAnalyzer } from '../src/analyzer';

async function runBasicTests() {
  console.log('🧪 Running basic analyzer tests...');
  
  const analyzer = createAnalyzer();
  
  // Test 1: eval detection
  console.log('\n1. Testing eval() detection...');
  const evalResult = await analyzer.analyzeContent('eval(userInput);', 'javascript', 'test.js');
  const hasEvalIssue = evalResult.issues.some(issue => issue.rule === 'eval-usage');
  console.log(`✅ Eval detection: ${hasEvalIssue ? 'PASS' : 'FAIL'}`);
  
  // Test 2: hardcoded secrets
  console.log('\n2. Testing hardcoded secrets detection...');
  const secretResult = await analyzer.analyzeContent('const apiKey = "sk-1234567890abcdef";', 'javascript', 'test.js');
  const hasSecretIssue = secretResult.issues.some(issue => issue.rule === 'hardcoded-secret');
  console.log(`✅ Secret detection: ${hasSecretIssue ? 'PASS' : 'FAIL'}`);
  
  // Test 3: console statements
  console.log('\n3. Testing console statement detection...');
  const consoleResult = await analyzer.analyzeContent('console.log("debug");', 'javascript', 'test.js');
  const hasConsoleIssue = consoleResult.issues.some(issue => issue.rule === 'console-log');
  console.log(`✅ Console detection: ${hasConsoleIssue ? 'PASS' : 'FAIL'}`);
  
  // Test 4: TODO comments
  console.log('\n4. Testing TODO comment detection...');
  const todoResult = await analyzer.analyzeContent('// TODO: Fix this later', 'javascript', 'test.js');
  const hasTodoIssue = todoResult.issues.some(issue => issue.rule === 'todo-comment');
  console.log(`✅ TODO detection: ${hasTodoIssue ? 'PASS' : 'FAIL'}`);
  
  // Test 5: Clean code
  console.log('\n5. Testing clean code (no issues)...');
  const cleanResult = await analyzer.analyzeContent('function add(a, b) { return a + b; }', 'javascript', 'test.js');
  const hasNoIssues = cleanResult.issues.length === 0;
  console.log(`✅ Clean code: ${hasNoIssues ? 'PASS' : 'FAIL'}`);
  
  // Test 6: Performance
  console.log('\n6. Testing performance...');
  const largeContent = Array(1000).fill('function test() { return 1; }').join('\n');
  const startTime = performance.now();
  await analyzer.analyzeContent(largeContent, 'javascript', 'test.js');
  const endTime = performance.now();
  const duration = endTime - startTime;
  const isUnder500ms = duration < 500;
  console.log(`✅ Performance (${duration.toFixed(2)}ms): ${isUnder500ms ? 'PASS' : 'FAIL'}`);
  
  // Test 7: Configuration
  console.log('\n7. Testing disabled analyzer...');
  const disabledAnalyzer = new CodeGuardianAnalyzer({ enabled: false });
  const disabledResult = await disabledAnalyzer.analyzeContent('eval(userInput);', 'javascript', 'test.js');
  const respectedDisabled = disabledResult.issues.length === 0;
  console.log(`✅ Disabled analyzer: ${respectedDisabled ? 'PASS' : 'FAIL'}`);
  
  // Test 8: Language detection
  console.log('\n8. Testing language detection...');
  const jsResult = await analyzer.analyzeContent('const x = 1;', 'javascript', 'test.js');
  const correctLanguage = jsResult.language === 'javascript';
  console.log(`✅ Language detection: ${correctLanguage ? 'PASS' : 'FAIL'}`);
  
  console.log('\n🎉 All tests completed!');
  
  // Count results
  const allTests = [hasEvalIssue, hasSecretIssue, hasConsoleIssue, hasTodoIssue, hasNoIssues, isUnder500ms, respectedDisabled, correctLanguage];
  const passedTests = allTests.filter(Boolean).length;
  console.log(`\n📊 Results: ${passedTests}/${allTests.length} tests passed`);
  
  if (passedTests === allTests.length) {
    console.log('🟢 All tests PASSED! ✨');
  } else {
    console.log('🔴 Some tests FAILED! 🚨');
  }
}

// Run the tests
runBasicTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});