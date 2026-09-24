pipeline {
    agent any

    environment {
        IMAGE_NAME = 'taskmanager-api'
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('Build') {
            steps {
                bat 'npm ci'
                bat 'npm run build'
                bat "docker build -t %IMAGE_NAME%:%IMAGE_TAG% -t %IMAGE_NAME%:latest ."
                echo "Built Docker image %IMAGE_NAME%:%IMAGE_TAG% (tagged with the Jenkins build number for traceability) and %IMAGE_NAME%:latest."
            }
        }

        stage('Test') {
            steps {
                bat 'npm test'
            }
            post {
                always {
                    // Fails the stage loudly if coverage/lcov.info wasn't produced,
                    // which SonarCloud needs in the next stage.
                    bat 'if not exist coverage\\lcov.info (echo Missing coverage report && exit /b 1)'
                }
            }
        }

        stage('Code Quality') {
            steps {
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                    bat 'sonar-scanner.bat -Dsonar.login=%SONAR_TOKEN%'
                }
            }
        }

        stage('Security') {
            steps {
                bat 'npm audit --json > npm-audit-report.json || exit /b 0'
                bat 'npm audit || exit /b 0'
                archiveArtifacts artifacts: 'npm-audit-report.json', allowEmptyArchive: true
                echo 'Security scan complete. Findings are documented and triaged in the task report (fixed / justified / accepted).'
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker compose -f docker-compose.staging.yml down || exit /b 0'
                bat 'docker compose -f docker-compose.staging.yml up -d'
                echo 'Deployed to staging container taskmanager-api-staging on port 3001.'
            }
        }

        stage('Release') {
            steps {
                bat "docker tag %IMAGE_NAME%:%IMAGE_TAG% %IMAGE_NAME%:production"
                bat 'docker compose -f docker-compose.prod.yml down || exit /b 0'
                bat 'docker compose -f docker-compose.prod.yml up -d'
                bat 'git config --global user.email "praneeth4517@gmail.com"'
                bat 'git config --global user.name "Praneeth"'
                bat "git tag -a v1.0.%IMAGE_TAG% -m \"Automated release from Jenkins build %IMAGE_TAG%\""
                withCredentials([usernamePassword(credentialsId: 'GITHUB_PAT', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
                    bat "git push https://%GIT_USER%:%GIT_TOKEN%@github.com/praneeth4517-stack/taskmanager-api.git v1.0.%IMAGE_TAG%"
                }
                echo "Promoted image to %IMAGE_NAME%:production, deployed to production container on port 3002, and pushed git tag v1.0.%IMAGE_TAG%."
            }
        }

        stage('Monitoring') {
            steps {
                script {
                    def statusCode = bat(
                        script: '@powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri http://localhost:3002/health -UseBasicParsing -TimeoutSec 5; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"',
                        returnStatus: true
                    )
                    if (statusCode != 0) {
                        emailext(
                            subject: "ALERT: taskmanager-api production health check FAILED - Build #${env.BUILD_NUMBER}",
                            body: "The production health check at http://localhost:3002/health did not return HTTP 200 after deployment. Please investigate immediately.",
                            to: 'praneeth4517@gmail.com',
                            attachLog: true
                        )
                        echo 'Health check FAILED - alert email sent to the on-call address.'
                        error('Production health check failed - see alert email.')
                    } else {
                        echo 'Health check PASSED - production service is healthy and responding on /health.'
                    }
                }
            }
        }

    }

    post {
        success {
            echo "Pipeline completed successfully for build #${env.BUILD_NUMBER}."
        }
        failure {
            echo "Pipeline failed for build #${env.BUILD_NUMBER}. Check the stage logs above."
        }
    }
}
