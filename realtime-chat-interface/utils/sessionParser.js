import fs from 'fs';
import path from 'path';

/**
 * Parse the session-one.Rmd file and extract structured content
 * @param {string} filePath Path to the session-one.Rmd file
 * @returns {Object} Structured content with topics, code blocks, and sections
 */
export function parseSessionContent(filePath) {
  // Read the file content
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Split by lines to process sections
  const lines = content.split('\n');
  
  // Initialize the result structure
  const result = {
    title: '',
    date: '',
    topics: [],
    mcpServers: [],
    codeSnippets: [],
    sections: [],
    currentSection: null
  };
  
  // Extract YAML front matter for title and date
  let inYamlHeader = false;
  let currentSection = null;
  let currentCodeBlock = null;
  let currentCodeBlockLanguage = null;
  
  // Process line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Process YAML front matter
    if (line.trim() === '---') {
      inYamlHeader = !inYamlHeader;
      continue;
    }
    
    if (inYamlHeader) {
      if (line.startsWith('title:')) {
        result.title = line.replace('title:', '').trim().replace(/"/g, '');
      } else if (line.startsWith('date:')) {
        result.date = line.replace('date:', '').trim();
      }
      continue;
    }
    
    // Process code blocks
    if (line.startsWith('```')) {
      // If opening a code block
      if (!currentCodeBlock) {
        currentCodeBlockLanguage = line.replace('```', '').trim();
        currentCodeBlock = {
          language: currentCodeBlockLanguage,
          content: '',
          section: currentSection ? currentSection.title : 'Unknown'
        };
      } else {
        // Closing a code block
        result.codeSnippets.push(currentCodeBlock);
        
        // If it's an MCP server code block, extract server info
        if (currentSection && 
            (currentSection.title.includes('MCP') || 
             currentSection.title.toLowerCase().includes('server'))) {
          const serverMatch = currentCodeBlock.content.match(/perplexity|firecrawl|agentql|repomix/i);
          if (serverMatch) {
            result.mcpServers.push({
              name: serverMatch[0],
              installationCode: currentCodeBlock.content,
              section: currentSection.title
            });
          }
        }
        
        currentCodeBlock = null;
        currentCodeBlockLanguage = null;
      }
      continue;
    }
    
    // If we're inside a code block, add the line to it
    if (currentCodeBlock) {
      currentCodeBlock.content += line + '\n';
      continue;
    }
    
    // Process headings - main topics
    if (line.startsWith('# ')) {
      const title = line.replace('# ', '').trim();
      currentSection = {
        level: 1,
        title,
        content: '',
        subsections: []
      };
      result.sections.push(currentSection);
      result.topics.push(title);
      continue;
    }
    
    // Process subheadings
    if (line.startsWith('## ')) {
      const title = line.replace('## ', '').trim();
      if (currentSection && currentSection.level === 1) {
        const subsection = {
          level: 2,
          title,
          content: '',
          parent: currentSection.title
        };
        currentSection.subsections.push(subsection);
        currentSection = subsection;
      } else {
        // Handle case where a level 2 heading appears without a parent
        currentSection = {
          level: 2,
          title,
          content: '',
          subsections: [],
          parent: 'Root'
        };
        result.sections.push(currentSection);
      }
      result.topics.push(title);
      continue;
    }
    
    // Add content to current section
    if (currentSection) {
      currentSection.content += line + '\n';
    }
  }
  
  // Post-process to ensure MCP servers are properly categorized
  result.mcpServers = result.mcpServers.map(server => {
    // Extract proper name and details from content
    let name = server.name;
    
    // Clean up server name to be more readable
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    
    // Look for details in the section content
    const section = result.sections.find(s => 
      s.title.toLowerCase().includes(name.toLowerCase()) ||
      (s.content && s.content.toLowerCase().includes(name.toLowerCase()))
    );
    
    return {
      ...server,
      name,
      description: section ? section.content : 'No description available'
    };
  });
  
  // Remove duplicates from topics
  result.topics = [...new Set(result.topics)];
  
  return result;
}

/**
 * Get information about a specific topic from the parsed session content
 * @param {Object} parsedContent The parsed session content
 * @param {string} topic The topic to search for
 * @returns {Object} Information about the topic
 */
export function getTopicInformation(parsedContent, topic) {
  // Case-insensitive search for the topic
  const topicLower = topic.toLowerCase();
  
  // First try exact section match
  const exactSection = parsedContent.sections.find(
    section => section.title.toLowerCase() === topicLower
  );
  
  if (exactSection) {
    return {
      title: exactSection.title,
      content: exactSection.content,
      subsections: exactSection.subsections.map(sub => ({
        title: sub.title,
        summary: sub.content.substring(0, 100) + '...'
      }))
    };
  }
  
  // Try partial section match
  const partialSection = parsedContent.sections.find(
    section => section.title.toLowerCase().includes(topicLower)
  );
  
  if (partialSection) {
    return {
      title: partialSection.title,
      content: partialSection.content,
      subsections: partialSection.subsections.map(sub => ({
        title: sub.title,
        summary: sub.content.substring(0, 100) + '...'
      }))
    };
  }
  
  // Try subsection match
  for (const section of parsedContent.sections) {
    if (!section.subsections) continue;
    
    const matchingSubsection = section.subsections.find(
      sub => sub.title.toLowerCase().includes(topicLower)
    );
    
    if (matchingSubsection) {
      return {
        title: matchingSubsection.title,
        content: matchingSubsection.content,
        parentTopic: section.title
      };
    }
  }
  
  // Try content match (look for mentions of the topic in content)
  for (const section of parsedContent.sections) {
    if (section.content.toLowerCase().includes(topicLower)) {
      // Extract the relevant part of the content containing the topic
      const lines = section.content.split('\n');
      const relevantLines = lines.filter(line => 
        line.toLowerCase().includes(topicLower)
      );
      
      return {
        title: section.title,
        content: relevantLines.join('\n'),
        matchType: 'content',
        fullSection: section.title
      };
    }
    
    // Also check subsections content
    if (!section.subsections) continue;
    
    for (const subsection of section.subsections) {
      if (subsection.content.toLowerCase().includes(topicLower)) {
        // Extract the relevant part of the content containing the topic
        const lines = subsection.content.split('\n');
        const relevantLines = lines.filter(line => 
          line.toLowerCase().includes(topicLower)
        );
        
        return {
          title: subsection.title,
          content: relevantLines.join('\n'),
          matchType: 'content',
          fullSection: section.title,
          subsection: subsection.title
        };
      }
    }
  }
  
  // If no matches found
  return {
    title: topic,
    content: `No information found about "${topic}" in the session content.`,
    matchType: 'none',
    suggestedTopics: parsedContent.topics.slice(0, 5) // Suggest some topics
  };
}

/**
 * Get details about a specific MCP server
 * @param {Object} parsedContent The parsed session content
 * @param {string} serverName The name of the MCP server
 * @returns {Object} Information about the MCP server
 */
export function getMcpServerDetails(parsedContent, serverName) {
  const serverNameLower = serverName.toLowerCase();
  
  // Find matching server
  const server = parsedContent.mcpServers.find(
    s => s.name.toLowerCase().includes(serverNameLower)
  );
  
  if (server) {
    return {
      name: server.name,
      installationCode: server.installationCode,
      description: server.description
    };
  }
  
  // If no exact match, try to find info in sections
  for (const section of parsedContent.sections) {
    if (section.title.toLowerCase().includes('mcp') || 
        section.title.toLowerCase().includes('server')) {
      
      if (section.content.toLowerCase().includes(serverNameLower)) {
        // Extract relevant content about the server
        const lines = section.content.split('\n');
        const startIdx = lines.findIndex(line => 
          line.toLowerCase().includes(serverNameLower)
        );
        
        if (startIdx >= 0) {
          // Grab 10 lines or until the end
          const serverContent = lines.slice(startIdx, startIdx + 10).join('\n');
          
          return {
            name: serverName,
            description: serverContent,
            section: section.title,
            note: "Limited information available"
          };
        }
      }
      
      // Check subsections too
      if (!section.subsections) continue;
      
      for (const subsection of section.subsections) {
        if (subsection.content.toLowerCase().includes(serverNameLower)) {
          return {
            name: serverName,
            description: subsection.content,
            section: section.title,
            subsection: subsection.title
          };
        }
      }
    }
  }
  
  // If no matches found
  return {
    name: serverName,
    description: `No information found about "${serverName}" MCP server.`,
    availableServers: parsedContent.mcpServers.map(s => s.name)
  };
}

/**
 * Get information about the architecture diagram
 * @param {Object} parsedContent The parsed session content
 * @returns {Object} Information about the architecture diagram
 */
export function getArchitectureDiagram(parsedContent) {
  // Look for sections with architecture in the title or content
  const architectureSection = parsedContent.sections.find(
    section => 
      section.title.toLowerCase().includes('architecture') ||
      section.content.toLowerCase().includes('architecture diagram')
  );
  
  if (architectureSection) {
    // Find the mermaid diagram code block
    const mermaidBlock = parsedContent.codeSnippets.find(
      snippet => 
        snippet.section === architectureSection.title &&
        (snippet.language === 'mermaid' || 
         architectureSection.content.includes('mermaid('))
    );
    
    if (mermaidBlock) {
      return {
        title: architectureSection.title,
        diagramCode: mermaidBlock.content,
        description: architectureSection.content
      };
    }
    
    return {
      title: architectureSection.title,
      description: architectureSection.content,
      note: "Diagram code not found but architecture is described in this section"
    };
  }
  
  // Look for diagrams in any section
  const diagramCodeBlock = parsedContent.codeSnippets.find(
    snippet => snippet.language === 'mermaid' || snippet.content.includes('flowchart')
  );
  
  if (diagramCodeBlock) {
    return {
      title: "Architecture Diagram",
      diagramCode: diagramCodeBlock.content,
      note: "Found diagram code but no specific architecture section"
    };
  }
  
  return {
    title: "Architecture Diagram",
    description: "No architecture diagram information found in the session content."
  };
}