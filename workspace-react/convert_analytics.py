import re

with open('../frontend/analytics.html', 'r') as f:
    html = f.read()

body_match = re.search(r'<body>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
body = body_match.group(1) if body_match else html

body = re.sub(r'<!-- ========== NAVBAR ========== -->.*?</nav>', '', body, flags=re.DOTALL)
body = re.sub(r'<!-- Mobile overlay -->.*?</div>', '', body, flags=re.DOTALL)

body = body.replace('class=', 'className=')
body = body.replace('for=', 'htmlFor=')

body = body.replace('style="width: 72%"', 'style={{width: "72%"}}')
body = body.replace('style="width: 48%"', 'style={{width: "48%"}}')
body = body.replace('style="width: 15%"', 'style={{width: "15%"}}')
body = body.replace('style="width: 8%"', 'style={{width: "8%"}}')
body = body.replace('style="width: 32%"', 'style={{width: "32%"}}')

body = re.sub(r'<img(.*?)(?<!/)>', r'<img\1/>', body)
body = re.sub(r'<input(.*?)(?<!/)>', r'<input\1/>', body)
body = re.sub(r'<hr(.*?)(?<!/)>', r'<hr\1/>', body)
body = re.sub(r'<br(.*?)(?<!/)>', r'<br\1/>', body)

body = body.replace('href="index.html"', 'to="/"')
body = body.replace('href="dashboard.html"', 'to="/dashboard"')

body = body.replace('src="left/', 'src="/left/')
body = body.replace('src="right/', 'src="/right/')

body = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', body)

with open('../frontend/analytics.js', 'r') as f:
    js = f.read()

js_logic = """
import React, { useEffect } from 'react';
import Chart from 'chart.js/auto';

const Analytics = () => {
    useEffect(() => {
"""

js_logic += js.replace('(function () {', '').replace('})();', '')

js_logic += """
    }, []);

    return (
        <div className="analytics-page-container">
"""

jsx = js_logic + body + """
        </div>
    );
};

export default Analytics;
"""

with open('src/pages/Analytics.jsx', 'w') as f:
    f.write(jsx)

print("Created Analytics.jsx")
