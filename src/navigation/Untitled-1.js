
                setNidaLoading(true)
                const nidaValidationResult = await validateNIDANumber(data.nida);
                setNidaLoading(false)
            
              
                if (!nidaValidationResult.obj.error|| nidaValidationResult.obj.error.trim() === '') {
                  data.status='S.Valid';
                dispatch(userRegiter(data))
                  .unwrap()
                  .then(result => {
                    console.log('resultsss', result);
                    if (result.status) {
                      console.log('excuted this true block')
                      ToastAndroid.show(`${t('auth:userCreatedSuccessfully')}`, ToastAndroid.LONG);
                      navigation.navigate('Verify',{nextPage:'Verify'});
                    } else {
                      if (result.data) {
                        const errors = result.data.errors;
                        setDisappearMessage(
                          showErrorWithLineBreaks(formatErrorMessages(errors))
                        );
                    } else {
                        setDisappearMessage(result.message);
                    }
                    }

                    console.log('result');
                    console.log(result);
                  })
                  .catch(rejectedValueOrSerializedError => {
                    // handle error here
                    console.log('error');
                    console.log(rejectedValueOrSerializedError);
                  });

                }else{
                  setNidaError(t('auth:nidaDoesNotExist'))
                  console.log('NIDA validation failed:', nidaValidationResult.error);
                }