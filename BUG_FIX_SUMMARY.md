# Bug Fix: Auto-Flow Decision Logic Losing Posts Data on Timeout

## Problem Summary
When the fresh posts data request times out (15 seconds), the auto-flow decision logic incorrectly shows "Analyzing 0 posts" instead of using the cached 6 posts, triggering an incorrect "create new post" decision.

## Root Cause
**Data Structure Mismatch in Fallback Logic**

The bug was in `handleActionCompleted()` at lines 1307-1309 in `background.js`:

### Initial GET_POSTS Data Structure (from dom.js)
```javascript
{
  total: 6,
  lastPostDate: "...",
  posts: [...],        // ← Posts at TOP level
  lastPost: {...}
}
```

### Expected Structure by shouldCreatePost()
```javascript
{
  postsInfo: {
    posts: [...]       // ← Posts NESTED in postsInfo
  },
  lastPost: {...},
  userName: "..."
}
```

### The Bug
When timeout occurred, the fallback used:
```javascript
var dataForAnalysis = { ...data, userName: state.userName };
```

This preserved the wrong structure, so `shouldCreatePost()` checked `postsData.postsInfo.posts` (line 281) which was `undefined`, resulting in "0 posts" analysis.

## Solution
Normalize the cached data structure to match what `shouldCreatePost()` expects:

```javascript
var dataForAnalysis = {
    userName: state.userName,
    postsInfo: {
        posts: data?.posts || [],
        total: data?.total || 0,
        lastPostDate: data?.lastPostDate || null
    },
    lastPost: data?.lastPost || null
};
```

## Changes Made
**File: `lumi/src-bex/background.js`**

1. **Lines 1304-1319**: Fixed fresh data validation path
   - Added explicit check for `freshPostsData.dataFresh`
   - Added fallback normalization if fresh data is invalid

2. **Lines 1321-1335**: Fixed timeout catch block
   - Normalized cached data structure before passing to `shouldCreatePost()`
   - Added debug logging for normalized structure

## Testing
The fix ensures:
- ✅ When fresh data arrives: Uses properly structured fresh data
- ✅ When fresh data times out: Uses normalized cached data with correct structure
- ✅ `shouldCreatePost()` always receives data with `postsInfo.posts` structure
- ✅ Cached posts are preserved and analyzed correctly

## Data Flow Verification
All calls to `shouldCreatePost()` have been verified:

1. **Line 487** (`fetchNextPost`): Called with `{ userName }` only
   - Intentional: Always creates post (no posts data = create)
   - Used in `proceedWithPostCreation()` to generate new posts

2. **Line 550** (`handleCheckUserStatus`): Called with normalized data
   - ✅ Uses `normalizeLatestPostsData()` which returns correct structure
   - Structure: `{ userName, postsInfo: { posts }, lastUpdated }`

3. **Line 1338** (`handleActionCompleted`): Called with `dataForAnalysis`
   - ✅ **FIXED**: Now properly normalizes cached data structure
   - Handles both fresh data and timeout fallback paths

## Impact
This fix resolves the critical bug where:
- Posts data was lost after a 15-second timeout
- Decision logic incorrectly showed "0 posts" instead of cached 6 posts
- Wrong decision was made to create new posts unnecessarily

The fix ensures data integrity throughout the auto-flow decision pipeline.

