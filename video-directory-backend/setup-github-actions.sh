        run: |
          echo "✅ Staging deployment successful!"
          echo "URL: ${{ vars.STAGING_URL }}"

  deploy-production:
    name: Deploy to Production
    needs: deploy-staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    environment:
      name: production
      url: ${{ vars.PRODUCTION_URL }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build for production
        run: pnpm run build
        env:
          NODE_ENV: production
          PAYLOAD_SECRET: ${{ secrets.PAYLOAD_SECRET }}
          DATABASE_URI: ${{ secrets.DATABASE_URI }}
          PAYLOAD_PUBLIC_SERVER_URL: ${{ vars.PRODUCTION_URL }}
          SENTRY_DSN: ${{ secrets.SENTRY_DSN }}

      - name: Upload source maps to Sentry
        run: pnpm run sentry:sourcemaps
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}

      - name: Deploy to production
        run: |
          echo "🚀 Deploying to production environment..."
          # Add your production deployment command here
          # Example for Vercel: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
          # Example for Railway: railway deploy --service ${{ secrets.RAILWAY_SERVICE_ID }}

      - name: Run production health check
        run: |
          sleep 30  # Wait for deployment
          curl -f ${{ vars.PRODUCTION_URL }}/api/health || exit 1

      - name: Create database backup
        run: |
          echo "📦 Creating post-deployment backup..."
          # Add backup command here if needed

      - name: Notify success
        run: |
          echo "🎉 Production deployment successful!"
          echo "URL: ${{ vars.PRODUCTION_URL }}"
EOF

# Performance monitoring workflow
cat > .github/workflows/performance.yml << 'EOF'
name: Performance Monitoring

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  lighthouse:
    name: Lighthouse Performance Audit
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            ${{ vars.PRODUCTION_URL }}
            ${{ vars.PRODUCTION_URL }}/api/health
          configPath: './lighthouse.config.js'
          uploadArtifacts: true
          temporaryPublicStorage: true

  load-test:
    name: Load Testing
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run load tests
        run: |
          # Install artillery for load testing
          npm install -g artillery
          
          # Create basic load test config
          cat > load-test.yml << 'EOL'
          config:
            target: ${{ vars.PRODUCTION_URL }}
            phases:
              - duration: 60
                arrivalRate: 5
              - duration: 120
                arrivalRate: 10
          scenarios:
            - name: "API Health Check"
              requests:
                - get:
                    url: "/api/health"
            - name: "Get Videos"
              requests:
                - get:
                    url: "/api/videos?limit=10"
            - name: "Search Videos"
              requests:
                - get:
                    url: "/api/search/advanced?q=javascript"
          EOL
          
          # Run load test
          artillery run load-test.yml
EOF

# Security scanning workflow
cat > .github/workflows/security.yml << 'EOF'
name: Security Scan

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Monday at 2 AM

jobs:
  security-scan:
    name: Security Vulnerability Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: '10'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run npm audit
        run: pnpm audit

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Run CodeQL Analysis
        uses: github/codeql-action/init@v2
        with:
          languages: typescript, javascript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
EOF

echo "✅ GitHub Actions workflows created!"
echo ""
echo "🔧 Next steps:"
echo "1. Add these secrets to your GitHub repository:"
echo "   - PAYLOAD_SECRET"
echo "   - DATABASE_URI"
echo "   - STAGING_PAYLOAD_SECRET"
echo "   - STAGING_DATABASE_URI" 
echo "   - SENTRY_DSN"
echo "   - SENTRY_AUTH_TOKEN"
echo "   - SENTRY_ORG"
echo "   - SENTRY_PROJECT"
echo ""
echo "2. Add these variables to your GitHub repository:"
echo "   - STAGING_URL"
echo "   - PRODUCTION_URL"
echo ""
echo "3. Configure your deployment provider (Vercel, Railway, etc.)"
echo "4. Push to main branch to trigger first deployment"
echo ""
echo "📊 Your CI/CD pipeline includes:"
echo "- Automated testing on every PR"
echo "- Security vulnerability scanning"
echo "- Performance monitoring"
echo "- Staging deployment"
echo "- Production deployment with health checks"
echo "- Error tracking with Sentry"
