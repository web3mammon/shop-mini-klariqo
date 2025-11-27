We noticed an issue with your submission
Submission reference: GQQYKD
Shop Mini name: Voice Shopper by Klariqo
Thank you for submitting your Shop Mini for review. The latest submission has been reviewed, and we noticed some issues that need to be resolved.
Feedback message:
Thanks for your submission. The voice chat functionality works well, but there are some issues that need to be addressed before approval.

Critical Issues:

1. Voice Chat Intermittent Failures
Voice chat fails intermittently. Add proper error handling and user-friendly error messages when microphone permission is denied or device is unavailable.

2. UI Sizing Issues
Search result item icons are too large and the microphone button is too big. Reduce the size of these elements to create better visual balance and usability.

Platform Compliance Issues:

3. SDK Component Violations
HTML button elements used in App.tsx instead of SDK Button component. Replace with Button from @shopify/shop-minis-react.

4. Production Code Quality
Remove all console.log statements and eslint-disable comments from production code.

5. Inline Styles
Replace inline styles with Tailwind classes to comply with Content Security Policy requirements.

Please fix the intermittent failures and UI sizing issues, and address the platform compliance requirements before resubmitting.

We look forward to working with you to resolve the issues with your submission.
If you have questions about this submission, please talk to us in Slack or email shopminisdevelopers@shopify.com.
Thank you for contributing to Shop.
