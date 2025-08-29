exports.handler = async (event, context) => {
  // CORS headers for browser requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { title, description, fileData } = JSON.parse(event.body);
    
    // Get GitHub configuration from environment variables
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
    const REPO_NAME = process.env.GITHUB_REPO_NAME;

    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'GitHub configuration missing. Please set GITHUB_TOKEN, GITHUB_REPO_OWNER, and GITHUB_REPO_NAME environment variables.' 
        }),
      };
    }

    // Validate required fields
    if (!title || !description) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: title or description' 
        }),
      };
    }

    // GitHub API endpoint for creating pull requests
    const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls`;
    
    // Create branch name from title
    const branchName = `add-notes-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    
    // Prepare pull request data
    const prData = {
      title: `Add Notes: ${title}`,
      body: `## Description\n${description}\n\n## Changes\n- Added new notes file\n- Updated file index\n\n## Type of Change\n- [x] New feature (non-breaking change which adds functionality)\n\nThis pull request was created automatically via CS Notes Hub.`,
      head: branchName,
      base: 'main'
    };

    // Make request to GitHub API
    const response = await fetch(githubApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'CS-Notes-Hub'
      },
      body: JSON.stringify(prData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API Error:', errorData);
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `GitHub API Error: ${errorData.message || 'Unknown error'}`,
          details: errorData
        }),
      };
    }

    const pullRequest = await response.json();

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Pull request created successfully',
        pullRequest: {
          number: pullRequest.number,
          url: pullRequest.html_url,
          title: pullRequest.title,
          state: pullRequest.state
        }
      }),
    };

  } catch (error) {
    console.error('Pull request creation error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error during pull request creation',
        details: error.message
      }),
    };
  }
};