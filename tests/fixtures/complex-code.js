// Complex code with quality issues
function processUserData(users, filters, options, callback, errorHandler, progressCallback) {
  if (!users) return;
  
  let results = [];
  
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    
    if (user) {
      if (filters) {
        if (filters.age) {
          if (user.age) {
            if (filters.age.min) {
              if (user.age < filters.age.min) {
                continue;
              }
            }
            if (filters.age.max) {
              if (user.age > filters.age.max) {
                continue;
              }
            }
          }
        }
        
        if (filters.location) {
          if (user.location) {
            if (filters.location.country) {
              if (user.location.country !== filters.location.country) {
                continue;
              }
            }
            if (filters.location.city) {
              if (user.location.city) {
                if (user.location.city.toLowerCase() !== filters.location.city.toLowerCase()) {
                  continue;
                }
              }
            }
          }
        }
      }
      
      let processedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        location: user.location
      };
      
      if (options) {
        if (options.includeProfile) {
          processedUser.profile = user.profile;
        }
        if (options.includePreferences) {
          processedUser.preferences = user.preferences;
        }
        if (options.transform) {
          if (options.transform.upperCaseName) {
            processedUser.name = processedUser.name.toUpperCase();
          }
          if (options.transform.formatEmail) {
            processedUser.email = processedUser.email.toLowerCase().trim();
          }
        }
      }
      
      results.push(processedUser);
      
      if (progressCallback) {
        progressCallback(i + 1, users.length);
      }
    }
  }
  
  if (callback) {
    callback(results);
  }
  
  return results;
}