This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
# zLUX grid library
Adding the library to your package:
`npm install "git+ssh://git@github.com:gizafoundation/zlux-grid.git" --save-dev`

Imports:  
Module: `import { ZluxGridModule } from '@zlux/grid'`  
Component: `import { ZluxGridComponent } from '@zlux/grid'` template: `<zlux-grid>`  
Pipe: pure pipe to transform metaData of standard table json to columns format accepted by the component: `import { ZluxTableMetadataToColumnsPipe } from '@zlux/grid'` template: `zluxTableMetadataToColumns`  

# For Maintainers
Because this library is used an an npm package, you must remember to commit changes to index.js and index.js.map, and any other files that changed as the result of building the application (e.g. **/*.d.ts)

Also, remember to retain the copyright headers in those build products (they currently need to be restored "by hand")


This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
